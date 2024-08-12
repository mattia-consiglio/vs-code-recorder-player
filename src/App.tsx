import PlayerProvider from './PlayerProvider'
import StoreProvider from './redux/StoreProvider'
import './App.scss'

function App() {
	return (
		<StoreProvider>
			<h1 className='text-4xl text-center mb-5'>VS Code Recorder Player</h1>
			<PlayerProvider />
		</StoreProvider>
	)
}

export default App
