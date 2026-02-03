import React, { useState, useEffect } from 'react';
import Countdown from './Countdown';

const AuctionCard = ({ item, socket, serverTimeOffset, currentUser }) => {
    const [isBidding, setIsBidding] = useState(false);
    const [flashClass, setFlashClass] = useState('');
    const [isWinning, setIsWinning] = useState(false);
    const [hasEnded, setHasEnded] = useState(Date.now() + serverTimeOffset >= item.endTime);

    // Detect if current user is winning
    const myId = currentUser ? currentUser.id : socket.id;

    useEffect(() => {
        setIsWinning(item.highestBidder === myId);
    }, [item.highestBidder, myId]);

    // Handle flash animations on bid update
    useEffect(() => {
        // Determine flash type
        // If I am winning -> Success Green
        // If I WAS winning but now I'm NOT -> Danger Red (Outbid)
        // If someone else bit and I wasn't winning -> Neutral or Green update

        // Simple logic:
        // New bid comes in.
        setFlashClass('flash-success');
        const timer = setTimeout(() => setFlashClass(''), 800);
        return () => clearTimeout(timer);
    }, [item.currentBid]); // Trigger on bid change

    const handleBid = () => {
        setIsBidding(true);
        socket.emit('BID_PLACED', {
            itemId: item.id,
            amount: item.currentBid + 10,
            userId: myId
        });

        // Reset loading state after a short delay or listen for ACK
        setTimeout(() => setIsBidding(false), 500);
    };

    const isOutbid = !isWinning && item.highestBidder && item.highestBidder !== myId;

    return (
        <div className={`glass-panel ${flashClass}`} style={{
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            transition: 'border-color 0.3s'
        }}>
            {/* Image Area */}
            <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '8px',
                    padding: '4px 8px'
                }}>
                    <Countdown
                        endTime={item.endTime}
                        serverTimeOffset={serverTimeOffset}
                        onEnd={() => setHasEnded(true)}
                    />
                </div>

                {(isWinning || isOutbid || hasEnded) && (
                    <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        zIndex: 10,
                    }} className={`badge ${hasEnded && !item.highestBidder
                            ? 'badge-neutral'
                            : (isWinning ? 'badge-success' : 'badge-danger')
                        }`}>
                        {hasEnded && !item.highestBidder
                            ? 'Unsold'
                            : (isWinning
                                ? (hasEnded ? 'Won' : 'Winning')
                                : (hasEnded
                                    ? `Won by ${item.highestBidderName || 'Someone'}`
                                    : `Outbid by ${item.highestBidderName || 'Someone'}`
                                )
                            )
                        }
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div style={{ padding: 'var(--spacing-md)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: 'var(--spacing-xs)', fontSize: '1.25rem' }}>{item.title}</h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', marginBottom: 'var(--spacing-md)' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'hsl(var(--color-text-dim))' }}>Current Bid</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'hsl(var(--color-primary))' }}>
                            ${item.currentBid}
                        </div>
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleBid}
                    disabled={isBidding || Date.now() > item.endTime}
                    style={{ width: '100%' }}
                >
                    {isBidding ? 'Placing Bid...' : 'Bid +$10'}
                </button>
            </div>

            {/* Status Overlay/Border Effect */}
            {(isOutbid || isWinning) && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    border: `2px solid hsl(var(--color-${isWinning ? 'accent' : 'danger'}))`,
                    borderRadius: '16px',
                    pointerEvents: 'none',
                    boxShadow: `inset 0 0 20px hsl(var(--color-${isWinning ? 'accent' : 'danger'}) / 0.2)`
                }} />
            )}
        </div>
    );
};

export default AuctionCard;
