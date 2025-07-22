import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    allVehicles: [],
    filteredVehicles: [],
    filters: { company: [], type: [] },
    sortOrder: "asc",
};

const vehicleSlice = createSlice({
    name: "vehicle",
    initialState,
    reducers: {
        setVehicles: (state, action) => {
            state.allVehicles = action.payload;
            state.filteredVehicles = action.payload;
        },
        toggleCompanyFilter: (state, action) => {
            const company = action.payload;
            const isSelected = state.filters.company.includes(company);
            state.filters.company = isSelected ?
                state.filters.company.filter((c) => c !== company) : [...state.filters.company, company];
        },
        toggleTypeFilter: (state, action) => {
            const type = action.payload;
            const isSelected = state.filters.type.includes(type);
            state.filters.type = isSelected ?
                state.filters.type.filter((t) => t !== type) : [...state.filters.type, type];
        },
        setSortOrder: (state, action) => {
            state.sortOrder = action.payload;
        },
        applyFilters: (state) => {
            let vehicles = state.allVehicles;

            if (state.filters.company.length > 0) {
                vehicles = vehicles.filter((v) => state.filters.company.includes(v.company));
            }

            if (state.filters.type.length > 0) {
                vehicles = vehicles.filter((v) => state.filters.type.includes(v.type));
            }

            vehicles = vehicles.sort((a, b) =>
                state.sortOrder === "asc" ?
                a.pricePerHour - b.pricePerHour :
                b.pricePerHour - a.pricePerHour
            );

            state.filteredVehicles = vehicles;
        },
    },
});

export const {
    setVehicles,
    toggleCompanyFilter,
    toggleTypeFilter,
    setSortOrder,
    applyFilters,
} = vehicleSlice.actions;

export default vehicleSlice.reducer;