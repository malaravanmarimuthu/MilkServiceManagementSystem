import { useEffect, useState } from "react";
import { getLocations } from "../Services/LocationService";

function Location() {

    const [locations, setLocations] = useState<any[]>([]);

    useEffect(() => {
        loadLocations();
    }, []);

    const loadLocations = async () => {
        try {
            const data = await getLocations();
            console.log("Locations", data);
            setLocations(data);
        }
        catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="container mt-4">

            <h2>Locations</h2>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Location Name</th>
                    </tr>
                </thead>

                <tbody>
                    {locations.map((location: any) => (
                        <tr key={location.id}>
                            <td>{location.id}</td>
                            <td>{location.locationName}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}

export default Location;