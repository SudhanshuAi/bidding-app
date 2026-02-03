import React from 'react';
import AuctionCard from './AuctionCard';

const Dashboard = ({ items, socket, serverTimeOffset, currentUser }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--spacing-lg)'
        }}>
            {items.map(item => (
                <AuctionCard
                    key={item.id}
                    item={item}
                    socket={socket}
                    serverTimeOffset={serverTimeOffset}
                    currentUser={currentUser}
                />
            ))}
        </div>
    );
};

export default Dashboard;
