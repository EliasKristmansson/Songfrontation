import FontProvider from './components/fontProvider.jsx';
import Main from './components/main.jsx';

export default function Index() {
    return (
        <FontProvider>
            <Main
                options={{ orientation: 'all' }}
            />
        </FontProvider>


    );
}
