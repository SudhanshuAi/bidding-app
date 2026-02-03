const { placeBid, getItems, registerUser, resetAuctions } = require('./store');

function setupSockets(io) {
    io.on('connection', (socket) => {
        const token = socket.handshake.auth.token;
        console.log('New client connected:', socket.id, 'Token:', token);
        const user = registerUser(socket.id, token);
        socket.emit('WELCOME', { user });

        // Send initial data (optional, but good for immediate state)
        // socket.emit('INITIAL_ITEMS', getItems());

        socket.on('BID_PLACED', ({ itemId, amount, userId }) => {
            // Note: userId can be passed from client if auth exists, otherwise using socket.id
            const bidderId = socket.id;

            console.log(`Bid attempt on item ${itemId} for $${amount} by ${bidderId}`);

            const result = placeBid(itemId, amount, bidderId);

            if (result.success) {
                // Broadcast the update to EVERYONE including the sender
                // Payload: { itemId, newBid, highestBidder }
                io.emit('UPDATE_BID', {
                    itemId: result.item.id,
                    currentBid: result.item.currentBid,
                    itemId: result.item.id,
                    currentBid: result.item.currentBid,
                    highestBidder: result.item.highestBidder,
                    highestBidderName: result.item.highestBidderName
                });

                // Acknowledge success to sender (optional, useful for UI feedback)
                socket.emit('BID_ACCEPTED', { itemId });
            } else {
                // Send error ONLY to the specific client
                socket.emit('BID_ERROR', {
                    itemId,
                    message: result.message
                });
            }
        });

        socket.on('RESET_AUCTIONS', () => {
            const items = resetAuctions();
            io.emit('AUCTIONS_RESET', items);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
}

module.exports = setupSockets;
