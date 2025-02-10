import React, { useEffect, useState } from 'react';
import { BASE_URL } from './config'; // Adjust as needed

const BridgeWiseScore = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch(`${BASE_URL}/api/bms-score`)
            .then(response => response.json())
            .then(setData)
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    return (
        <div>
            <h2>Bridge Wise Score</h2>
            <table border="1" cellPadding="8" cellSpacing="0">
                <thead>
                    <tr>
                        <th>Bridge Name</th>
                        <th>District</th>
                        <th>Damage Score</th>
                        <th>Critical Damage Score</th>
                        <th>Inventory Score</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((row, index) => (
                            <tr key={index}>
                                <td>{row.bridge_name}</td>
                                <td>{row.district}</td>
                                <td>{row.damage_score}</td>
                                <td>{row.critical_damage_score}</td>
                                <td>{row.inventory_score}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">Loading data...</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default BridgeWiseScore;
