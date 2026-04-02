import MenuItem from '../models/MenuItem.js';

export const getMenuItems = async (req, res) => {
    try {
        let filter = {};
        if (req.query.restaurant) {
            filter.owner = req.query.restaurant;
        }
        const items = await MenuItem.find(filter).sort({ category: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getOwnerMenuItems = async (req, res) => {
    try {
        const items = await MenuItem.find({ owner: req.user._id }).sort({ category: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addMenuItem = async (req, res) => {
    try {
        const { name, price, category, isVeg } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : '';

        const item = await MenuItem.create({
            name, price, category, image, isVeg: isVeg === 'true' || isVeg === true,
            owner: req.user._id
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateMenuItem = async (req, res) => {
    try {
        const { name, price, category, isAvailable, isVeg } = req.body;
        const item = await MenuItem.findOne({ _id: req.params.id, owner: req.user._id });

        if (item) {
            item.name = name || item.name;
            item.price = price || item.price;
            item.category = category || item.category;
            item.isAvailable = typeof isAvailable !== 'undefined' ? isAvailable === 'true' || isAvailable === true : item.isAvailable;
            item.isVeg = typeof isVeg !== 'undefined' ? isVeg === 'true' || isVeg === true : item.isVeg;

            if (req.file) {
                item.image = `/uploads/${req.file.filename}`;
            }

            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.findOne({ _id: req.params.id, owner: req.user._id });
        if (item) {
            await MenuItem.deleteOne({ _id: item._id });
            res.json({ message: 'Menu item removed' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
