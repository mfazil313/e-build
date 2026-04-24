import Head from 'next/head'
import { AppProvider } from '../context/AppContext'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
    return (
        <AppProvider>
            <Head>
                <title>BuildMart - Construction Materials</title>
                <meta name="description" content="Premium construction materials marketplace" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Component {...pageProps} />
        </AppProvider>
    )
}

export default MyApp
