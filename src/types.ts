const PlayerState = {
	UNSTARTED: -1,
	ENDED: 0,
	PLAYING: 1,
	PAUSED: 2,
} as const

export type PlayerState = (typeof PlayerState)[keyof typeof PlayerState]
export { PlayerState }
