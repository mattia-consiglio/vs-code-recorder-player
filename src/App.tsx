import PlayerProvider from './PlayerProvider'
import StoreProvider from './redux/StoreProvider'

function App() {
	return (
		<StoreProvider>
			<PlayerProvider />
		</StoreProvider>
	)
}

export default App
