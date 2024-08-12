import { setCurrentTime } from './redux/reducers/playerReducer'
import { store } from './redux/store'
export class RecordingEmulator {
	private duration: number
	private currentTime: number
	private isPlaying: boolean
	private playBackRate: number
	private timer: ReturnType<typeof setInterval> | null

	constructor(duration: number) {
		this.duration = duration
		this.currentTime = 0
		this.isPlaying = false
		this.timer = null
		this.playBackRate = 1
	}

	play() {
		if (!this.isPlaying) {
			this.isPlaying = true
			this.startTimer()
		}
	}

	pause() {
		if (this.isPlaying) {
			this.isPlaying = false
			this.stopTimer()
		}
	}

	getCurrentTime() {
		return this.currentTime
	}

	setCurrentTime(time: number): void {
		this.currentTime = Math.min(Math.max(time, 0), this.duration)
		store.dispatch(setCurrentTime(this.currentTime))
	}

	getDuration() {
		return this.duration
	}

	private startTimer() {
		this.timer = setInterval(() => {
			if (this.currentTime < this.duration) {
				this.currentTime += 0.1
				store.dispatch(setCurrentTime(this.currentTime))
			} else {
				this.pause()
			}
		}, 100 / this.playBackRate)
	}

	private stopTimer() {
		if (this.timer) {
			clearInterval(this.timer)
			this.timer = null
		}
	}

	setPlaybackRate(rate: number) {
		this.playBackRate = rate
	}
}
