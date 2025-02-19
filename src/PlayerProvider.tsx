import CodePlayer from "./CodePlayer";
import FileSelector from "./FileSelector";
import Player from "./Player";
import { useAppSelector } from "./redux/store";

function PlayerProvider() {
	const content = useAppSelector((state) => state.player.content);
	return (
		<div className="space-y-6">
			<div className="bg-gray-700/30 rounded-lg p-4">
				<FileSelector />
			</div>

			{!!content.length && (
				<div className="space-y-4">
					<div className="bg-gray-700/30 rounded-lg p-4">
						<CodePlayer />

						<Player />
					</div>
				</div>
			)}
		</div>
	);
}

export default PlayerProvider;
