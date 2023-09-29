export interface Config {
    apiUrl: string;
    priceServerApiUrl: string;
    identityApiUrl: string;
    productApiUrl: string;
    dataApiUrl: string;
    userInfoApiUrl: string;
    serverApiKey: string;
    useSimulatedTrade: boolean;
    secret: string;
    tigerFirebase: {
        apiKey: string;
        authDomain: string;
        databaseURL: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
        measurementId: string;
    },
    futuFirebase: {
        apiKey: string;
        authDomain: string;
        databaseURL: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
        measurementId: string;
    },
    ibFirebase: {
        apiKey: string;
        authDomain: string;
        databaseURL: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
        measurementId: string;
    };
}