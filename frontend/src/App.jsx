import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Dashboard from './components/Dashboard';

// Initialize socket outside component to prevent multiple connections on re-render
// For dev env, we assume localhost:3001
const getSessionId = () => {
    let sessionId = localStorage.getItem('auction_session_id');
    if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('auction_session_id', sessionId);
    }
    return sessionId;
};

const socket = io('http://localhost:3001', {
    auth: {
        token: getSessionId()
    }
});

function App() {
    const [items, setItems] = useState([]);
    const [serverTimeOffset, setServerTimeOffset] = useState(0);
    const [connected, setConnected] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        // Initial Fetch
        fetch('http://localhost:3001/items')
            .then(res => res.json())
            .then(data => {
                setItems(data.items);
                const latency = Date.now() - data.serverTime; // Approximate
                // data.serverTime is server time when req sent. 
                // Better: requestTime + latency/2 = serverTime.
                // Simplification for assignment:
                setServerTimeOffset(data.serverTime - Date.now());
            })
            .catch(err => console.error("Failed to fetch items:", err));

        // Socket Events
        socket.on('connect', () => {
            setConnected(true);
        });

        socket.on('WELCOME', (data) => {
            setCurrentUser(data.user);
        });

        socket.on('UPDATE_BID', (updatedItem) => {
            setItems(prevItems => prevItems.map(item =>
                item.id === updatedItem.itemId
                    ? { ...item, ...updatedItem }
                    : item
            ));
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        return () => {
            socket.off('connect');
            socket.off('UPDATE_BID');
            socket.off('disconnect');
        };
    }, []);

    return (
        <div className="app-layout">
            <header style={{ padding: 'var(--spacing-lg) 0', borderBottom: '1px solid var(--color-border)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>
                        <span style={{ color: 'hsl(var(--color-primary))' }}>Live</span>Bid
                    </h1>
                    <div className="connection-status">
                        <span style={{
                            height: '8px',
                            width: '8px',
                            borderRadius: '50%',
                            background: connected ? 'hsl(var(--color-accent))' : 'hsl(var(--color-danger))',
                            display: 'inline-block',
                            marginRight: '8px'
                        }}></span>
                        {connected ? 'Live Connected' : 'Disconnected'}
                        {currentUser && <div style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-dim))', marginTop: '4px' }}>Welcome, {currentUser.name}</div>}
                    </div>
                </div>
            </header>

            <main style={{ padding: 'var(--spacing-xl) 0' }}>
                <div className="container">
                    <Dashboard items={items} socket={socket} serverTimeOffset={serverTimeOffset} currentUser={currentUser} />
                </div>
            </main>
        </div>
    );
}

export default App;
