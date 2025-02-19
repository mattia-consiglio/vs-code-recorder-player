import PlayerProvider from "./PlayerProvider";
import StoreProvider from "./redux/StoreProvider";

function App() {
	return (
		<StoreProvider>
			<div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 text-white p-8">
				<div className="max-w-6xl mx-auto">
					<h1 className="text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
						VS Code Recorder Player
					</h1>
					<div className="bg-stone-800/50 backdrop-blur-sm rounded-xl shadow-xl p-6">
						<PlayerProvider />
					</div>
				</div>
			</div>
		</StoreProvider>
	);
}

export default App;
