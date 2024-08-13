import { PayloadAction, createSlice } from '@reduxjs/toolkit'
export interface TimingContentRecord {
	sequence: number
	startTime: number
	endTime: number
}

export interface ContentRecord {
	text: string
	file: string
	language: string
}

export type CompleteContentRecord = ContentRecord & TimingContentRecord

interface PlayerState {
	content: CompleteContentRecord[]
	currentTime: number
	playerState: number
	isInFocus: boolean
	currentSpeed: number
	duration: number
}

const initialState: PlayerState = {
	content: [],
	currentTime: 0,
	playerState: -1,
	isInFocus: false,
	currentSpeed: 1,
	duration: 0,
}

const playerReducer = createSlice({
	name: 'player',
	initialState,
	reducers: {
		/**
		 * Sets the content of the player state.
		 *
		 * @param {PlayerState} state - The current player state.
		 * @param {PayloadAction<CompleteContentRecord[]>} action - The action containing the new content.
		 * @return {void}
		 */
		setContent(state: PlayerState, action: PayloadAction<CompleteContentRecord[]>): void {
			const content = action.payload
			state.content = content
			state.duration = content[content.length - 1]?.endTime || 0
		},
		setCurrentTimeState(state, action: PayloadAction<number>) {
			state.currentTime = action.payload
		},
		setPlayerState(state, action: PayloadAction<number>) {
			state.playerState = action.payload
		},
		setPlayerIsInFocus(state, action: PayloadAction<boolean>) {
			state.isInFocus = action.payload
		},
		setPaybackRateState(state, action: PayloadAction<number>) {
			state.currentSpeed = action.payload
		},
		setDuration(state, action: PayloadAction<number>) {
			state.duration = action.payload
		},
		resetPlayerState(state) {
			Object.assign(state, initialState)
		},
	},
})

export const {
	setCurrentTimeState,
	setPlayerState,
	setPlayerIsInFocus,
	setPaybackRateState,
	setContent,
	setDuration,
	resetPlayerState,
} = playerReducer.actions

export default playerReducer.reducer
