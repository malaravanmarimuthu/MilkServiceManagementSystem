import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createLocation } from "../Services/LocationService";
import { handleApiError } from "../Helpers/errorHandler";
import ErrorModal from "../Components/ErrorModal";

function AddLocation() {

    const navigate = useNavigate();

    const [locationName, setLocationName] = useState("");
    const [street, setStreet] = useState("");
    const [pincode, setPincode] = useState("");

    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (
        e: React.FormEvent
    ) => {

        e.preventDefault();

        try {

            await createLocation({
                locationName,
                street,
                pincode,
            });

            navigate("/location");

        } catch (error) {

            setErrorMessage(
                handleApiError(error)
            );
        }
    };

    return (
        <div className="container mt-4">

            <div
                className="card shadow p-4 mx-auto"
                style={{ maxWidth: "600px" }}
            >

                <h2 className="text-center mb-4">
                    Add Location
                </h2>

                <ErrorModal
                    message={errorMessage}
                    onClose={() => setErrorMessage("")}
                />

                <form onSubmit={handleSubmit}>

                    <div className="mb-3">
                        <label className="form-label">
                            Location Name
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            value={locationName}
                            onChange={(e) =>
                                setLocationName(e.target.value)
                            }
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Street
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            value={street}
                            onChange={(e) =>
                                setStreet(e.target.value)
                            }
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Pincode
                        </label>

                        <input
                            type="text"
                            className="form-control"
                            value={pincode}
                            onChange={(e) =>
                                setPincode(e.target.value)
                            }
                        />
                    </div>

                    <div className="d-flex gap-2">

                        <button
                            type="submit"
                            className="btn btn-success"
                        >
                            Save
                        </button>

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                navigate("/location")
                            }
                        >
                            Back
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default AddLocation;