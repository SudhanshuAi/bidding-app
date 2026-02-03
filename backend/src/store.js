/**
 * In-memory store for auction items.
 * Since Node.js is single-threaded, synchronous operations on this object are atomic.
 */

// Initial seed data
const items = [
    {
        id: 1,
        title: "Vintage Camera 1950s",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        startPrice: 100,
        currentBid: 100,
        highestBidder: null, // Socket ID
        highestBidderName: null,
        endTime: Date.now() + 1000 * 60 * 5, // 5 minutes from restart
    },
    {
        id: 2,
        title: "Limited Edition Sneakers",
        image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        startPrice: 250,
        currentBid: 250,
        highestBidder: null,
        highestBidderName: null,
        endTime: Date.now() + 1000 * 60 * 3, // 3 minutes
    },
    {
        id: 3,
        title: "Gaming Headset Pro",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        startPrice: 50,
        currentBid: 50,
        highestBidder: null,
        highestBidderName: null,
        endTime: Date.now() + 1000 * 60 * 10, // 10 minutes
    },
    {
        id: 4,
        title: "Mechanical Keyboard",
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
        startPrice: 120,
        currentBid: 120,
        highestBidder: null,
        highestBidderName: null,
        endTime: Date.now() + 1000 * 60 * 7, // 7 minutes
    }
];

function getItems() {
    return items;
}

const users = {}; // map persistentId -> { name, id: persistentId }
const socketToUser = {}; // map socketId -> persistentId
let userCount = 0;

function registerUser(socketId, persistentId) {
    if (!persistentId) {
        // Fallback for non-authenticated sockets (shouldn't happen with our frontend)
        persistentId = 'anon_' + socketId;
    }

    // Check if we already know this user
    if (!users[persistentId]) {
        userCount++;
        const name = `User ${userCount}`;
        users[persistentId] = { name, id: persistentId };
    }

    // Map this socket connection to the user
    socketToUser[socketId] = persistentId;

    return users[persistentId];
}

function getUser(socketId) {
    const persistentId = socketToUser[socketId];
    return users[persistentId];
}

function getItemById(id) {
    return items.find(i => i.id === parseInt(id));
}

/**
 * Places a bid on an item.
 * @param {number} itemId 
 * @param {number} amount 
 * @param {string} bidderId - Socket ID of the bidder
 * @returns {object} result - { success: boolean, message: string, item: object }
 */
function placeBid(itemId, amount, bidderId) {
    const item = getItemById(itemId);
    const bidder = getUser(bidderId);
    const bidderName = bidder ? bidder.name : 'Unknown';

    if (!item) {
        return { success: false, message: "Item not found" };
    }

    // Check if auction ended
    if (Date.now() >= item.endTime) {
        return { success: false, message: "Auction has ended" };
    }

    // Race condition handling:
    // Node.js Event Loop ensures this block runs entirely before handling the next checking event.
    // Validate that the new amount is strictly higher than current bid.
    if (amount <= item.currentBid) {
        return { success: false, message: "Bid must be higher than current price", currentBid: item.currentBid };
    }

    // Update logic
    item.currentBid = amount;
    item.highestBidder = bidder ? bidder.id : bidderId;
    item.highestBidderName = bidderName;

    // Optionally extend time if bid is placed in last few seconds (Sniping protection - optional but good ux)
    // For this assignment, kept simple as purely strict end time unless requested otherwise.

    return { success: true, item };
}

function resetAuctions() {
    const durations = {
        1: 5, // 5 mins
        2: 3, // 3 mins
        3: 10, // 10 mins
        4: 7 // 7 mins
    };

    items.forEach(item => {
        item.currentBid = item.startPrice;
        item.highestBidder = null;
        item.highestBidderName = null;
        // Reset time relative to NOW
        item.endTime = Date.now() + (durations[item.id] || 5) * 60 * 1000;
    });
    return items;
}

module.exports = {
    getItems,
    getItemById,
    getItems,
    getItemById,
    placeBid,
    registerUser,
    getUser,
    resetAuctions
};
