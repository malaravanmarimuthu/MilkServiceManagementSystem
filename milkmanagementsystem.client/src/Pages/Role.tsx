import { useEffect, useState } from "react";
import { getRoles } from "../Services/RoleService";

function Role() {

    const [roles, setRoles] = useState<any[]>([]);

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            const data = await getRoles();
            console.log("Roles", data);
            setRoles(data);
        }
        catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="container mt-4">

            <h2>Roles</h2>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Role Name</th>
                    </tr>
                </thead>

                <tbody>
                    {roles.map((role: any) => (
                        <tr key={role.id}>
                            <td>{role.id}</td>
                            <td>{role.roleName}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>
    );
}

export default Role;