const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    sender: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Message', messageSchema);