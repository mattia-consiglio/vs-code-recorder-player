import CodePlayer from './CodePlayer'
import FileSelector from './FileSelector'
import Player from './Player'
import { useAppSelector } from './redux/store'

function PlayerProvider() {
	const content = useAppSelector(state => state.player.content)
	return (
		<div>
			<FileSelector />
			{!!content.length && (
				<>
					<CodePlayer />
					<Player />
				</>
			)}
		</div>
	)
}

export default PlayerProvider
