import Loader from 'react-dots-loader';
import 'react-dots-loader/index.css';
 
export default function SplashScreen() {
	return (
		<div style={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			height: '100vh',
			backgroundColor: '#fff',
		}}>
			<div style={{
				width: 120,
				height: 120,
				backgroundColor: '#e0e0e0',
				borderRadius: 24,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				marginBottom: 32,
				fontSize: 32,
				color: '#aaa',
			}}>
				{/* Placeholder for app icon */}
				<span>Icon</span>
			</div>
			<span style={{
				fontSize: 24,
				color: '#333',
				fontWeight: 'bold',
				letterSpacing: 1,
			}}>
				loading the game
                {" "}
                <Loader size={10}/>
			</span>
		</div>
	);
}
