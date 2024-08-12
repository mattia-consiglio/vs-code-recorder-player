'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import VideoControls from './VideoControls'
import './videoPlayer.scss'
import { useAppDispatch, useAppSelector } from './redux/store'
import { setCurrentTime, setVideoSpeed } from './redux/reducers/playerReducer'
import { RecordingEmulator } from './RecordingEmulator'

const PlayerState = {
	UNSTARTED: -1,
	ENDED: 0,
	PLAYING: 1,
	PAUSED: 2,
} as const

export type PlayerState = (typeof PlayerState)[keyof typeof PlayerState]
export { PlayerState }
export default function Player() {
	const { duration } = useAppSelector(state => state.player)
	const [player, setPlayer] = useState(duration ? new RecordingEmulator(duration) : null)
	const playerWrapper = useRef<HTMLDivElement>(null)
	const dispatch = useAppDispatch()

	const [isFullscreen, setIsFullscreen] = useState(false)
	const fullscreenTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
	const [hideControls, setHideControls] = useState(false)
	const lastMousePosition = useRef({ x: 0, y: 0 })
	const shouldKeepControlsVisible = useRef(false)

	useEffect(() => {
		setPlayer(new RecordingEmulator(duration))
	}, [duration])

	const seekTo = (seconds: number) => {
		if (player) {
			player.setCurrentTime(seconds)
			dispatch(setCurrentTime(seconds))
		}
	}

	const changeSpeed = (speed: number) => {
		if (player) {
			player.setPlaybackRate(speed)
			dispatch(setVideoSpeed(speed))
		}
	}

	const openFullscreen = useCallback(() => {
		playerWrapper.current?.requestFullscreen()
		setIsFullscreen(true)
		setHideControls(true)
	}, [playerWrapper])

	const closeFullscreen = useCallback((manually = false) => {
		if (document.fullscreenElement?.id !== 'videoPlayerWrapper' || manually) {
			if (manually) {
				document.exitFullscreen()
			}
			setIsFullscreen(false)
		}
	}, [])

	const toggleFullscreen = useCallback(() => {
		if (document.fullscreenElement?.id === 'videoPlayerWrapper') {
			closeFullscreen(true)
		} else {
			openFullscreen()
		}
	}, [closeFullscreen, openFullscreen])

	const handleHideControls = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		const { clientX, clientY } = e
		const { x, y } = lastMousePosition.current
		const distance = Math.sqrt(Math.pow(clientX - x, 2) + Math.pow(clientY - y, 2))

		if (fullscreenTimeout.current) {
			clearTimeout(fullscreenTimeout.current)
		}
		if (distance > 20) {
			setHideControls(false)
			lastMousePosition.current = { x: clientX, y: clientY }
		}

		fullscreenTimeout.current = setTimeout(() => {
			if (!shouldKeepControlsVisible.current) {
				setHideControls(true)
			}
			lastMousePosition.current = { x: clientX, y: clientY }
		}, 1000)
	}, [])

	return (
		<div
			className={'flex flex-col gap-3 video-player-wrapper' + (hideControls ? ' hide' : '')}
			ref={playerWrapper}
			id='videoPlayerWrapper'
			role='region'
			aria-label='Video player'
			onMouseMove={e => handleHideControls(e)}
		>
			<VideoControls
				player={player}
				seekTo={seekTo}
				changeSpeed={changeSpeed}
				isFullscreen={isFullscreen}
				toggleFullscreen={toggleFullscreen}
				closeFullscreen={closeFullscreen}
				shouldKeepControlsVisible={shouldKeepControlsVisible}
			/>
		</div>
	)
}
