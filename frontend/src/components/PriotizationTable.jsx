import React from 'react'

const PriotizationTable = () => {
  return (
    <>
       <h1>Priotization Table</h1>
         <table className="table table-striped table-bordered table-hover">
            <thead>
                <tr>
                    <th>Task</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>

            <tbody>
                <tr>
                    <td>Task 1</td>
                    <td>High</td>
                    <td>2023-10-01</td>
                    <td>In Progress</td>
                    <td>
                        <button className="btn btn-primary">Edit</button>
                        <button className="btn btn-danger">Delete</button>
                    </td>
                </tr>
                <tr>
                    <td>Task 2</td>
                    <td>Medium</td>
                    <td>2023-10-05</td>
                    <td>Completed</td>
                    <td>
                        <button className="btn btn-primary">Edit</button>
                        <button className="btn btn-danger">Delete</button>
                    </td>
                </tr>
                <tr>
                    <td>Task 3</td>
                    <td>Low</td>
                    <td>2023-10-10</td>
                    <td>Not Started</td>
                    <td>
                        <button className="btn btn-primary">Edit</button>
                        <button className="btn btn-danger">Delete</button>
                    </td>
                </tr>
                <tr>
                    <td>Task 4</td>
                    <td>High</td>
                    <td>2023-10-15</td>
                    <td>In Progress</td>
                    <td>
                        <button className="btn btn-primary">Edit</button>
                        <button className="btn btn-danger">Delete</button>
                    </td>
                </tr>
                <tr>
                    <td>Task 5</td>
                    <td>Medium</td>
                    <td>2023-10-20</td>
                    <td>Completed</td>
                    <td>
                        <button className="btn btn-primary">Edit</button>
                        <button className="btn btn-danger">Delete</button>
                    </td>
                </tr>       
                </tbody>
            </table>    

    </>
  )
}

export default PriotizationTable
