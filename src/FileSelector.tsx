import { FormEvent, useCallback, useRef } from 'react'
import { CompleteContentRecord, ContentRecord, setContent } from './redux/reducers/playerReducer'
import { useAppDispatch } from './redux/store'

enum ChangeType {
	CONTENT = 'content',
	TAB = 'tab',
}
const allowedFileExtensions = ['srt', 'csv', 'json']

function FileSelector() {
	const fileRef = useRef<HTMLInputElement>(null)
	const dispatch = useAppDispatch()

	const removeDoubleQuotes = useCallback((text: string): string => {
		return text.replace(/^"(.*)"$/, '$1')
	}, [])

	const unescapeString = useCallback((text: string): string => {
		return text
			.replace(/""/g, '"')
			.replace(/\\r\\n/g, '\r\n')
			.replace(/\\n/g, '\n')
			.replace(/\\r/g, '\r')
			.replace(/\\t/g, '\t')
	}, [])

	const parseSrtTimeInMs = useCallback((time: string) => {
		const [hours, minutes, seconds, milliseconds] = time
			.replace(/,/g, ':')
			.split(':')
			.map(parseFloat)
		return hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000 + milliseconds
	}, [])

	const getFileExtension = (file: File) => {
		return file.name.split('.').pop() ?? ''
	}

	// const testStreamFile = async (file: File) => {
	// 	const stream = file.stream()
	// 	const reader = stream.getReader()
	// 	// let result = ''
	// 	let i = 0
	// 	while (true) {
	// 		const { done, value } = await reader.read()
	// 		if (done) break
	// 		console.log('line i:', i, 'content:', new TextDecoder().decode(value))
	// 		i++
	// 		// result += new TextDecoder().decode(value)
	// 	}
	// }

	const parseSRTFile = useCallback(
		(text: string) => {
			const lineBreak = /\r\n\r\n\r\n|\n\n\n|\r\n\r\n|\n\n/
			const lines = text.split(lineBreak).filter(line => line.trim() !== '')
			const srtContent: CompleteContentRecord[] = []
			lines.forEach(line => {
				const lineBreak = /\r\n|\n/
				const parts = line.split(lineBreak)
				const sequence = srtContent.length
					? srtContent[srtContent.length - 1].sequence + 1
					: parseInt(parts[0])
				const [startTime, endTime] = parts[1].split(' --> ').map(parseSrtTimeInMs)
				const subtitleText = parts[2] ? parts[2] : ''
				if (subtitleText === srtContent[srtContent.length - 1]?.text) {
					srtContent[srtContent.length - 1].endTime = endTime
					return
				}
				if (subtitleText === '') return

				const subtitleJson: ContentRecord = JSON.parse(subtitleText)

				srtContent.push({ sequence, startTime, endTime, ...subtitleJson })
			})
			return srtContent
		},
		[parseSrtTimeInMs]
	)

	const parseCSVFile = useCallback(
		(text: string) => {
			const processedChanges: CompleteContentRecord[] = []
			const lines = text.split('\n')
			for (let i = 1; i < lines.length; i++) {
				const line = lines[i]
				console.log(line)
				const lineArr = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)

				const sequence = parseInt(lineArr[0])
				if (isNaN(sequence)) {
					continue
				}
				const time = parseInt(lineArr[1])
				const file = removeDoubleQuotes(lineArr[2])
				const rangeOffset = parseInt(lineArr[3])
				const rangeLength = parseInt(lineArr[4])
				const text = unescapeString(removeDoubleQuotes(lineArr[5]))
				const language = lineArr[6]
				const type = lineArr[7]
				console.log('i', i)

				let newText = ''

				// const penultimateProcessedChange =
				// 	processedChanges.length - 1 <= 0 ? 0 : processedChanges.length - 1
				const penultimateProcessedChange = i - 2 <= 0 ? 0 : i - 2
				if (type === ChangeType.TAB) {
					newText = text
				} else {
					console.log('processedChanges', processedChanges)
					console.log('penultimateProcessedChange', penultimateProcessedChange)
					const newTextSplit = processedChanges[penultimateProcessedChange].text.split('')
					newTextSplit.splice(rangeOffset, rangeLength, text)
					newText = newTextSplit.join('')
				}
				processedChanges.push({
					sequence,
					file,
					startTime: time,
					endTime: 0,
					language,
					text: newText,
				})

				processedChanges[penultimateProcessedChange].endTime = time
			}
			processedChanges[processedChanges.length - 1].endTime =
				processedChanges[processedChanges.length - 1].startTime
			return processedChanges
		},
		[removeDoubleQuotes, unescapeString]
	)

	const parseJSONFile = useCallback((text: string) => {
		const output: CompleteContentRecord[] = JSON.parse(text)
		return output
	}, [])

	const parseFile = useCallback(
		(e: FormEvent<HTMLInputElement>) => {
			const file = (e.target as HTMLInputElement).files?.[0]
			if (!file) return
			const extension = getFileExtension(file)
			if (!allowedFileExtensions.includes(extension)) {
				alert('File type not supported')
				return
			}
			// testStreamFile(file)
			const reader = new FileReader()
			reader.onload = async e => {
				e.preventDefault()
				const text = e.target?.result as string
				let content: CompleteContentRecord[] = []

				if (extension === 'srt') {
					content = parseSRTFile(text)
				}
				if (extension === 'csv') {
					content = parseCSVFile(text)
				}
				if (extension === 'json') {
					content = parseJSONFile(text)
				}
				dispatch(setContent(content))
			}
			reader.readAsText(file)
			if (fileRef.current) fileRef.current.value = ''
		},
		[dispatch, parseCSVFile, parseJSONFile, parseSRTFile]
	)
	return (
		<div>
			<label htmlFor='liveEditorFile' className='block'>
				Select a recording file
			</label>
			<input
				type='file'
				name='liveEditorFile'
				id='liveEditorFile'
				accept={allowedFileExtensions.join(',')}
				onInput={e => parseFile(e)}
				ref={fileRef}
			/>
			<button onClick={() => dispatch(setContent([]))}>Clear file</button>
		</div>
	)
}

export default FileSelector
