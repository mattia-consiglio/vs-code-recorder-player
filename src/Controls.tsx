import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	IoChevronBackSharp,
	IoChevronForwardSharp,
	IoPauseSharp,
	IoPlaySharp,
} from 'react-icons/io5'
import { MdOutlineCheck } from 'react-icons/md'
import { useAppDispatch, useAppSelector } from './redux/store'
import { RecordingEmulator } from './RecordingEmulator'
import { PlayerState } from './types'

interface ControlsProps {
	player: RecordingEmulator | null
	seekTo: (time: number) => void
	changeSpeed: (speed: number) => void
}

function formatTime(time: number) {
	const minutes = Math.floor(time / 60)
	const seconds = Math.floor(time % 60)
	const secondsText = seconds < 10 ? `0${seconds}` : seconds
	return `${minutes}:${secondsText}`
}

function formatPercentageTime(percentage: number, duration: number) {
	const time = (percentage / 100) * duration
	return formatTime(time)
}

export default function Controls({ player, seekTo, changeSpeed }: Readonly<ControlsProps>) {
	const { playerState, isInFocus, currentSpeed, currentTime } = useAppSelector(
		state => state.player
	)
	const duration = useAppSelector(state => state.player.duration) / 1000
	const dispatch = useAppDispatch()
	const playerControls = useRef<HTMLDivElement>(null)
	const [currentTimeText, setCurrentTimeText] = useState(
		formatPercentageTime(currentTime, duration)
	)
	const durationText = useMemo(() => formatTime(duration), [duration])
	const [isHovering, setIsHovering] = useState(false)
	const progressBar = useRef<HTMLDivElement>(null)
	const HoverPercentage = useRef(0)
	const isDragging = useRef(false)
	const isDragged = useRef(false)
	const [isOptionsOpen, setIsOptionsOpen] = useState(false)
	const isOptionsOpenRef = useRef(isOptionsOpen)
	const availableSpeeds: number[] = [0.25, 0.5, 1, 1.25, 1.5, 2]

	const isProgressBarHovering = useRef(false)

	function getCursorPosition(e: MouseEvent) {
		if (!progressBar.current) return 0
		const rect = progressBar.current.getBoundingClientRect()
		const offsetX = e.clientX - rect.left
		const percentage = Math.min(Math.max(0, (offsetX / rect.width) * 100), 100)
		return percentage
	}
	const seek = useCallback(
		(seconds?: number) => {
			seconds = seconds ?? (HoverPercentage.current / 100) * duration
			if (player) {
				seekTo(seconds)
			}
		},
		[duration, player, seekTo]
	)

	const closeOpenedOptions = () => {
		if (isOptionsOpenRef.current) {
			setIsOptionsOpen(false)
			isOptionsOpenRef.current = false
		}
	}

	// update percentage on mouse hover
	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			const percentage = getCursorPosition(e)
			HoverPercentage.current = percentage
			setCurrentTimeText(formatPercentageTime(percentage, duration))
			setIsHovering(true)
			if (isDragging.current) {
				seek()
			}
		},
		[duration, seek]
	)

	function handleMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
		e.stopPropagation()
		isProgressBarHovering.current = false
		if (!isDragging.current) {
			setIsHovering(false)
		}
	}

	function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
		e.stopPropagation()
		isDragging.current = true
		isDragged.current = true
		const nativeEvent = e.nativeEvent
		handleMouseMove(nativeEvent)
		closeOpenedOptions()
		window.addEventListener('mousemove', handleMouseMove)
		window.addEventListener('mouseup', handleMouseUp)
	}

	const handleMouseUp = useCallback(() => {
		setIsHovering(false)
		isDragging.current = false
		window.removeEventListener('mousemove', handleMouseMove)
		window.removeEventListener('mouseup', handleMouseUp)
		seek()
	}, [handleMouseMove, seek])

	const handleMouseOver = useCallback(() => {
		isProgressBarHovering.current = true
	}, [])

	const playPause = useCallback(() => {
		if (playerState === PlayerState.PLAYING) {
			player?.pause()
		} else {
			player?.play()
		}
	}, [dispatch, player, playerState])

	function seekBackward() {
		if (player) {
			seek(Math.max(player.getCurrentTime() - 5, 0))
		}
	}
	function seekForward() {
		if (player) {
			seek(Math.min(player.getCurrentTime() + 5, duration))
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!playerControls.current) return
		if (!isInFocus) return
		switch (e.key) {
			case 'ArrowRight':
			case 'j':
			case 'J':
				e.preventDefault()
				seekForward()
				break
			case 'ArrowLeft':
			case 'l':
			case 'L':
				e.preventDefault()
				seekBackward()
				break
			case ' ':
			case 'Space':
			case 'k':
			case 'K':
				e.preventDefault()
				playPause()
				break
			case 'o':
				e.preventDefault()
				setIsOptionsOpen(true)
				isOptionsOpenRef.current = true
				break
		}
	}

	useEffect(() => {
		document.addEventListener('keydown', handleKeydown)

		return () => {
			document.removeEventListener('keydown', handleKeydown)
		}
	})

	const goBackOption = useMemo(
		() => (
			<li
				className='flex items-center gap-2 cursor-pointer'
				role='menuitem'
				aria-roledescription='menuitem'
				tabIndex={0}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
					}
				}}
			>
				<IoChevronBackSharp /> Indietro
			</li>
		),
		[]
	)

	const setPlaybackSpeed = (
		e: React.MouseEvent<HTMLLIElement, MouseEvent> | React.KeyboardEvent<HTMLLIElement>,
		speed: number
	) => {
		e.stopPropagation()
		changeSpeed(speed)
		setIsOptionsOpen(false)
		isOptionsOpenRef.current = false
	}

	return (
		<div
			ref={playerControls}
			className='player-controls'
			style={{
				height: isDragging.current ? '100%' : '',
				opacity: isDragging.current ? 1 : '',
				cursor: 'default',
			}}
			onClick={() => {
				closeOpenedOptions()
				isDragged.current = false
			}}
		>
			<div
				className='progress-bar-wrapper'
				onMouseMove={e => handleMouseMove(e.nativeEvent)}
				onMouseLeave={handleMouseLeave}
				onMouseDown={handleMouseDown}
				onMouseOver={handleMouseOver}
				ref={progressBar}
				style={{ opacity: isDragging.current ? 1 : '' }}
				aria-roledescription='progressbar'
				role='slider'
				tabIndex={0}
				aria-valuemin={0}
				aria-valuemax={duration}
				aria-valuenow={currentTime}
				aria-valuetext={currentTimeText}
				aria-label={`${currentTimeText}/${durationText}`}
			>
				<div
					className={`circle${isHovering || isDragging.current ? ' active' : ''}`}
					style={{ left: `${(currentTime / duration) * 100}%` }}
				></div>
				<div className='progress' style={{ width: `${(currentTime / duration) * 100}%` }} />
				<div
					className='h-full bg-white/30'
					style={{
						width: `${HoverPercentage.current}%`,
						visibility: isHovering ? 'visible' : 'hidden',
					}}
				></div>

				<div
					className='time-hover-text'
					style={{
						left: `${HoverPercentage.current}%`,
						visibility: isHovering ? 'visible' : 'hidden',
					}}
				>
					{currentTimeText}
				</div>
			</div>
			<div className='controls text-white'>
				<div className='left'>
					<button
						onClick={e => {
							e.stopPropagation()
							seekBackward()
							closeOpenedOptions()
						}}
						className='text-xl'
					>
						<IoChevronBackSharp /> 5s
					</button>
					<button
						onClick={e => {
							e.stopPropagation()
							playPause()
							closeOpenedOptions()
						}}
						className='text-3xl'
					>
						{playerState === PlayerState.PLAYING ? <IoPauseSharp /> : <IoPlaySharp />}
					</button>
					<button
						onClick={e => {
							e.stopPropagation()
							seekForward()
							closeOpenedOptions()
						}}
						className='text-xl'
						onDoubleClick={e => {
							e.stopPropagation()
						}}
					>
						5s <IoChevronForwardSharp />
					</button>
					<div>
						{formatTime(currentTime)} / {formatTime(duration)}
					</div>
				</div>
				<div className='right'>
					<button
						onClick={e => {
							e.stopPropagation()
						}}
					>
						{/* <IoLogoClosedCaptioning /> */}
					</button>
					<div className='flex items-center relative gap-2'>
						<div
							className={`options-menu absolute bottom-7 bg-neutral-800 right-0${
								isOptionsOpen ? ' block' : ' hidden'
							}`}
							role='menu'
						>
							<ul>
								{goBackOption}
								{availableSpeeds.map(speed => (
									<li
										key={'videoSpeed_' + speed}
										className={`flex items-center${
											currentSpeed === speed ? ' justify-between text-primary' : ' justify-end'
										}`}
										onClick={e => setPlaybackSpeed(e, speed)}
										role='menuitem'
										tabIndex={0}
										onKeyDown={e => {
											if (e.key === 'Enter' || e.key === ' ') {
												e.preventDefault()
												setPlaybackSpeed(e, speed)
											}
										}}
									>
										{currentSpeed === speed ? <MdOutlineCheck /> : <div />}
										{speed + 'x'}
									</li>
								))}
							</ul>
						</div>
						<button
							className='text-xl'
							onClick={e => {
								e.stopPropagation()
								setIsOptionsOpen(!isOptionsOpen)
								isOptionsOpenRef.current = !isOptionsOpenRef.current
							}}
						>
							{currentSpeed + 'x'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
