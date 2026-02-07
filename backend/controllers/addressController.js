import addressModel from "../models/addressModel.js";
import userModel from "../models/userModel.js";

// Add new address
const addAddress = async (req, res) => {
    try {
        const { userId, name, phone, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

        const addressData = {
            userId,
            name,
            phone,
            addressLine1,
            addressLine2: addressLine2 || "",
            city,
            state,
            pincode,
            isDefault: isDefault || false
        };

        // If this is set as default, unset other defaults
        if (isDefault) {
            await addressModel.updateMany({ userId }, { isDefault: false });
        }

        const address = new addressModel(addressData);
        await address.save();

        // If this is the first address or set as default, update user's defaultAddressId
        if (isDefault) {
            await userModel.findByIdAndUpdate(userId, { defaultAddressId: address._id });
        }

        res.json({ success: true, message: "Address added successfully", addressId: address._id });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get all addresses for a user
const getUserAddresses = async (req, res) => {
    try {
        const { userId } = req.body;

        const addresses = await addressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 });

        res.json({ success: true, addresses });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update address
const updateAddress = async (req, res) => {
    try {
        const { addressId, name, phone, addressLine1, addressLine2, city, state, pincode } = req.body;

        const updateData = {
            name,
            phone,
            addressLine1,
            addressLine2: addressLine2 || "",
            city,
            state,
            pincode
        };

        await addressModel.findByIdAndUpdate(addressId, updateData);

        res.json({ success: true, message: "Address updated successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete address
const deleteAddress = async (req, res) => {
    try {
        const { addressId, userId } = req.body;

        const address = await addressModel.findById(addressId);

        if (!address) {
            return res.json({ success: false, message: "Address not found" });
        }

        // If deleting default address, set another as default
        if (address.isDefault) {
            const otherAddress = await addressModel.findOne({ userId, _id: { $ne: addressId } });
            if (otherAddress) {
                otherAddress.isDefault = true;
                await otherAddress.save();
                await userModel.findByIdAndUpdate(userId, { defaultAddressId: otherAddress._id });
            } else {
                await userModel.findByIdAndUpdate(userId, { defaultAddressId: null });
            }
        }

        await addressModel.findByIdAndDelete(addressId);

        res.json({ success: true, message: "Address deleted successfully" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Set default address
const setDefaultAddress = async (req, res) => {
    try {
        const { addressId, userId } = req.body;

        // Unset all other defaults
        await addressModel.updateMany({ userId }, { isDefault: false });

        // Set this as default
        await addressModel.findByIdAndUpdate(addressId, { isDefault: true });

        // Update user's defaultAddressId
        await userModel.findByIdAndUpdate(userId, { defaultAddressId: addressId });

        res.json({ success: true, message: "Default address updated" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { addAddress, getUserAddresses, updateAddress, deleteAddress, setDefaultAddress };
