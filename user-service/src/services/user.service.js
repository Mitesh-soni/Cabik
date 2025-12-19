export default purchaseOrderDetailsQuery = async (req, res) => {
    const { purchaseOrderDetails } = req.body

    

    vehicleName = purchaseOrderDetails.basicvehicleDetails.vehicleName
    vehicleAmount = purchaseOrderDetails.basicvehicleDetails.vehicleAmount
    vehiclegst = purchaseOrderDetails.basicvehicleDetails.vehiclegst
} 