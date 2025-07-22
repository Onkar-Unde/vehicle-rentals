const updateVehicleAvailability = () => {
    const vehicles = JSON.parse(localStorage.getItem("vehicles")) || [];
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const now = new Date();

    const updatedVehicles = vehicles.map((vehicle) => {
        const hasActiveBooking = bookings.some(
            (b) =>
            b.vehicle === vehicle.name &&
            new Date(b.endDateTime) > now
        );
        return {
            ...vehicle,
            available: !hasActiveBooking,
        };
    });

    localStorage.setItem("vehicles", JSON.stringify(updatedVehicles));
};

export default updateVehicleAvailability;