'use client'
import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { Editor, Monaco } from '@monaco-editor/react'
import { emmetCSS, emmetHTML, emmetJSX } from 'emmet-monaco-es'
import { editor } from 'monaco-editor'
import { SiCss3, SiHtml5, SiJavascript, SiTypescript } from 'react-icons/si'

export interface MonacoFile {
	name: string
	language: string
	value: string
	isChanged?: boolean
}
export interface CodeEditorFilesMap {
	[key: string]: MonacoFile
}

interface CodeEditorProps {
	currenFile: string
	files: CodeEditorFilesMap
	externalEditorRef?: React.MutableRefObject<editor.IStandaloneCodeEditor>
	externalSelectedFile?: React.MutableRefObject<string>
}

const fileIcons: { [key: string]: ReactElement } = {
	'html': <SiHtml5 />,
	'css': <SiCss3 />,
	'js': <SiJavascript />,
	'ts': <SiTypescript />,
}

export default function CodeEditor({
	files,
	currenFile,
	externalEditorRef,
	externalSelectedFile,
}: CodeEditorProps) {
	const [fileName, setFileName] = useState(currenFile)
	// const prevFileName = useRef(currenFile)
	const localEditorRef = useRef(null as unknown as editor.IStandaloneCodeEditor)
	const editorRef = externalEditorRef !== undefined ? externalEditorRef : localEditorRef
	const monacoRef = useRef(null as unknown as Monaco)

	const file = files ? files[fileName] : null

	useEffect(() => {
		setFileName(currenFile)
		if (externalSelectedFile !== undefined) externalSelectedFile.current = currenFile
	}, [currenFile, externalSelectedFile])

	const handleTabChange = (tabFile: string) => {
		setFileName(tabFile)
		if (!files) return
		const file = files[tabFile]
		editorRef.current?.setValue(file?.value)
		if (externalSelectedFile !== undefined) externalSelectedFile.current = tabFile
		console.log('externalSelectedFile', externalSelectedFile?.current)
	}

	//add emmet support
	const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
		emmetHTML(monaco)
		emmetCSS(monaco)
		emmetJSX(monaco)
		editorRef.current = editor
		monacoRef.current = monaco
	}

	return (
		<div className='w-full'>
			<div className=' h-[50vh] w-full'>
				{files && (
					<div>
						{Object.entries(files).map(tabFile => (
							<button
								key={tabFile[0]}
								onClick={() => handleTabChange(tabFile[0])}
								className={`inline-flex gap-1 items-center p-2 border-t-3 mr-[0.15rem] hover:bg-[#2e2e2e] text-neutral-200 text-left ${
									fileName === tabFile[0]
										? 'bg-[#1e1e1e] border-t-[#3399cc]'
										: 'bg-[#34352f] border-t-[#34352f]'
								} `}
							>
								{fileIcons[files[tabFile[0]].language]}
								{tabFile[1].name}
							</button>
						))}
						{/* <button onClick={() => handleEditorChange('hello')}>Add Change</button> */}
					</div>
				)}
				<Editor
					height='calc(100% - 40px)'
					width='100%'
					language={file?.language ? file.language : 'auto'}
					path={currenFile}
					theme='vs-dark'
					onMount={handleEditorDidMount}
					options={{
						readOnly: true,
					}}
				/>
			</div>
		</div>
	)
}
