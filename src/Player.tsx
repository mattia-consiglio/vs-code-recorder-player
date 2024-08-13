import { useCallback, useEffect, useRef, useState } from 'react'
import Controls from './Controls'
import './videoPlayer.scss'
import { useAppDispatch, useAppSelector } from './redux/store'
import { setCurrentTimeState, setPaybackRateState } from './redux/reducers/playerReducer'
import { RecordingEmulator } from './RecordingEmulator'

export default function Player() {
	const { duration } = useAppSelector(state => state.player)
	const [player, setPlayer] = useState<RecordingEmulator | null>(null)
	const playerWrapper = useRef<HTMLDivElement>(null)
	const dispatch = useAppDispatch()

	useEffect(() => {
		setPlayer(duration ? new RecordingEmulator(duration) : null)
	}, [duration])

	const seekTo = useCallback(
		(seconds: number) => {
			player?.setCurrentTime(seconds)
			dispatch(setCurrentTimeState(seconds))
		},
		[dispatch, player]
	)

	const changeSpeed = useCallback(
		(speed: number) => {
			player?.setPlaybackRate(speed)
			dispatch(setPaybackRateState(speed))
		},
		[dispatch, player]
	)

	return (
		<div
			className='flex flex-col gap-3 player-wrapper'
			ref={playerWrapper}
			id='playerWrapper'
			role='region'
			aria-label='Video player'
		>
			<Controls player={player} seekTo={seekTo} changeSpeed={changeSpeed} />
		</div>
	)
}
