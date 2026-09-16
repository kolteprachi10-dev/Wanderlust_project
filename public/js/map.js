locationiq.key = mapToken;

const map = new maplibregl.Map({
    container: "map",
    style: locationiq.getLayer("Streets"),
    center: coordinates,
    zoom: 11
});


// House icon
const houseIcon = document.createElement("div");

houseIcon.innerHTML = `
    <svg width="42" height="42" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
        <circle cx="21" cy="21" r="19" fill="#ff385c"/>
        
        <!-- House roof -->
        <path
            d="M10 21 L21 12 L32 21"
            fill="none"
            stroke="white"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
        />

        <!-- House body -->
        <path
            d="M13 20 V31 H29 V20"
            fill="white"
        />

        <!-- Door -->
        <rect
            x="19"
            y="24"
            width="4"
            height="7"
            fill="#ff385c"
        />
    </svg>
`;

houseIcon.style.cursor = "pointer";


// Marker
const marker = new maplibregl.Marker({
    element: houseIcon
})
    .setLngLat(coordinates)
    .setPopup(
        new maplibregl.Popup({ offset: 25 })
            .setHTML(`
                <p>
                    <h5>${listingTitle}</h5>
                    <h6>${listingLocation}</h6>
                    Exact Location provided after booking
                </p>
            `)
    )
    .addTo(map);