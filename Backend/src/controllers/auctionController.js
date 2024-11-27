import Auction from '../models/auctionModel.js';
import Product from '../models/productModel.js';
import Seller from '../models/sellerModel.js';


export const createAuction = async(req, res) => {
    const { product, seller, startingPrice, bidEndDate } = req.body;
    try {
        const existingSeller = await Seller.findById(seller);
        const existingProduct = await Product.findById(product);

        if(!existingSeller){
            return res.status(404).json({
                success: false,
                message: 'Seller not found.'
            });
        }

        if(!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        if(existingProduct.isInAuction) {
            return res.status(400).json({
                success: false,
                message: 'This product is already in an active auction.'
            });
        }

        const auction = new Auction({
            product,
            seller,
            startingPrice,
            bidEndDate
        });

        const savedAuction = await auction.save();

        existingProduct.isInAuction = true;
        existingProduct.auctionHistory.push(savedAuction._id);
        await existingProduct.save();

        return res.status(201).json({
            success: true,
            message: 'Auction created successfully',
            data: savedAuction
        });
    } catch (error) {
        console.error("Error creating auction", error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


export const allAuction = async(req, res) => {
    try {
        const auctions = await Auction.find().populate('product', 'name description').populate('seller', 'name email');

        return res.status(200).json({
            success: true,
            data: auctions
        });
    } catch (error) {
        console.error('Error fetching all auctions.', error);
        return res.status(500).json({
            success: false,
            messahe: 'Server error'
        });
    }
};


export const getAuctionById = async(req, res) => {
    const { id } = req.params;
    try {
        const auction = await Auction.findById(id).populate('product', 'name description').populate('seller', 'name email').populate('bids');

        if(!auction){
            return res.status(404).json({
                success: false,
                messasge: 'Auction not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: auction
        });
    } catch (error) {
        console.error('Error fetching auction.' , error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


export const updateAuctionStatus = async(req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const auction = await Auction.findByIdAndUpdate(id, {status}, {new: true});

        if(!auction){
            return res.status(404).json({
                success: false,
                message: 'Auction not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Auction status updated.',
            data: auction
        });
    } catch (error) {
        console.error('Error updating auction status', error);
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
};


export const deleteAuction = async(req, res) => {
    const { id } = req.params;

    try {
        const auction = await Auction.findByIdAndDelete(id);

        if(!auction){
            return res.status(404).json({
                success: false,
                message: 'Auction not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Auction deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting auction.');
        return res.status(500).json({
            success: false,
            message: 'Server error.'
        });
    }
};