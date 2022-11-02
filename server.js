const mySQL2 = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');

//creating connection to db
const connection = mySQL2.createConnection ({
    host: "localhost",
    database: "employees",
    user:'root',
    password: 'Khursheda777!'
     });

     function promptUser () {
        inquirer
        .prompt([
            {
              name: 'choices',
              type: 'list',
              message: 'Please select an option:',
              choices: [
                'View All Employees',
                'View All Roles',
                'View All Departments',
                'View All Employees By Department',
                'View Department Budgets',
                'Update Employee Role',
                'Add Employee',
                'Add Role',
                'Add Department',
                'Remove Employee',
                
                ]
            }
          ])
          .then((answers) => {
          
            const {choices} = answers;
          
              if (choices === 'View All Employees') {
                  viewAllEmployees();
              }
      
              if (choices === 'View All Departments') {
                viewAllDepartments();
            }
      
              if (choices === 'View All Employees By Department') {
                  viewEmployeesByDepartment();
              }
      
              if (choices === 'Add Employee') {
                  addEmployee();
              }
      
              if (choices === 'Remove Employee') {
                  removeEmployee();
              }
      
              if (choices === 'Update Employee Role') {
                  updateEmployeeRole();
              }
      
             
      
              if (choices === 'View All Roles') {
                  viewAllRoles();
              }
      
              if (choices === 'Add Role') {
                  addRole();
              }
      
              if (choices === 'Add Department') {
                  addDepartment();
              }
      
              if (choices === 'View Department Budgets') {
                  viewDepartmentBudget();
              }
      
              
      
              // if (choices === 'Exit') {
              //     connection.end();
              // }
        });
      };


      // View All Employees
const viewAllEmployees = () => {
    let sql =       `SELECT employee.id, 
                    employee.first_name, 
                    employee.last_name, 
                    role.title, 
                    department.department_name AS 'department', 
                    role.salary
                    FROM employee, role, department 
                    WHERE department.id = role.department_id 
                    AND role.id = employee.role_id
                    ORDER BY employee.id ASC`;
    connection.promise().query(sql)
     .then(([rows]) => {
      console.table(rows)
      promptUser();
     })
  };

// View all Roles
const viewAllRoles = () => {
  const sql =     `SELECT role.id, role.title, department.department_name AS department
                  FROM role
                  INNER JOIN department ON role.department_id = department.id`;
  connection.promise().query(sql)
  .then(([rows]) => {
  console.table(rows)
  promptUser();
  });
};

// View all Employees by Department
const viewEmployeesByDepartment = () => {
    const sql =     `SELECT employee.first_name, 
                    employee.last_name, 
                    department.department_name AS department
                    FROM employee 
                    LEFT JOIN role ON employee.role_id = role.id 
                    LEFT JOIN department ON role.department_id = department.id`;
    connection.promise().query(sql)
      .then(([rows]) => {
      console.table(rows)
      promptUser();
      });
  };
  
  // View all Departments
  const viewAllDepartments = () => {
    const sql =   `SELECT department.id AS id, department.department_name AS department FROM department`; 
    connection.promise().query(sql)
     .then(([rows]) => {
      console.table(rows)
      promptUser();
    });
  };

 //View all Departments by Budget
  const viewDepartmentBudget = () => {
   const sql =     `SELECT department_id AS id, 
                    department.department_name AS department,
                    SUM(salary) AS budget
                    FROM  role 
                    INNER JOIN department ON role.department_id = department.id GROUP BY  role.department_id`;
    connection.promise().query(sql) 
    .then(([rows]) => {
    console.table(rows)
    promptUser();
    });
  };

  // Add a New Employee
const addEmployee = () => {
    inquirer.prompt([
      {
        type: 'input',
        name: 'fistName',
        message: "What is the employee's first name?",
        validate: addFirstName => {
          if (addFirstName) {
              return true;
          } else {
              console.log('Please enter a first name');
              return false;
          }
        }
      },
      {
        type: 'input',
        name: 'lastName',
        message: "What is the employee's last name?",
        validate: addLastName => {
          if (addLastName) {
              return true;
          } else {
              console.log('Please enter a last name');
              return false;
          }
        }
      }
    ])
      .then(answer => {
      const crit = [answer.fistName, answer.lastName]
      const roleSql = `SELECT id, title FROM role;`;
      connection.promise().query(roleSql)   
      .then((data) => {
       
       const roles = data[0].map(({ id, title }) => ({ name: title, value: id })); 
      
    
        
        inquirer.prompt([
              {
                type: 'list',
                name: 'role',
                message: "What is the employee's role?",
                choices: roles
              }
            ])
              .then(roleChoice => {
                const role = roleChoice.role;
                crit.push(role);
                const managerSql =  `SELECT * FROM employee`;
                connection.promise().query(managerSql)
                  .then ((data) => {

                  
                  const managers = data[0].map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));
                  inquirer.prompt([
                    {
                      type: 'list',
                      name: 'manager',
                      message: "Who is the employee's manager?",
                      choices: managers
                    }
                  ])
                    .then(managerChoice => {
                      const manager = managerChoice.manager;
                      crit.push(manager);
                      const sql =   `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                    VALUES (?, ?, ?, ?)`;
                      connection.query(sql, crit, (error) => {
                      if (error) throw error;
                      console.log("Employee has been added!")
                      viewAllEmployees();
                });
              });
            });
          });
       });
      })
    };
  
  
  // Add a New Role
const addRole = () => {
    const sql = 'SELECT * FROM department'
    connection.promise().query(sql)
    .then((response) =>  {
      
        let deptNamesArray = [];
        response[0].forEach((department) => {deptNamesArray.push(department.department_name);});
        deptNamesArray.push('Create Department');
        inquirer
          .prompt([
            {
              name: 'departmentName',
              type: 'list',
              message: 'Which department is this new role in?',
              choices: deptNamesArray
            }
          ])
          .then((answer) => {
            if (answer.departmentName === 'Create Department') {
              this.addDepartment();
            } else {
              addRoleResume(answer);
            }
          });
  
        const addRoleResume = (departmentData) => {
          inquirer
            .prompt([
              {
                name: 'newRole',
                type: 'input',
                message: 'What is the name of your new role?',
                
              },
              {
                name: 'salary',
                type: 'input',
                message: 'What is the salary of this new role?',
               
              }
            ])
            .then((answer) => {
              let createdRole = answer.newRole;
              let departmentId;
  
              response.forEach((department) => {
                if (departmentData.departmentName === department.department_name) {departmentId = department.id;}
              });
  
              let sql =   `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
              let crit = [createdRole, answer.salary, departmentId];
  
              connection.promise().query(sql)
              .then((crit) => {
                console.log(crit);
                console.log(`Role successfully created!`);
                viewAllRoles();
              });
            });
        };
      });
    };
  
  // Add a New Department
  const addDepartment = () => {
      inquirer
        .prompt([
          {
            name: 'newDepartment',
            type: 'input',
            message: 'What is the name of your new Department?',
           
          }
        ])
        .then((answer) => {
          let sql =     `INSERT INTO department (department_name) VALUES (?)`;
          connection.query(sql, answer.newDepartment, (error, response) => {
            if (error) throw error;
            console.log(answer.newDepartment + ` Department successfully created!`);
            viewAllDepartments();
          });
        });
  };
  //Update an Employee's Role
  const updateEmployeeRole = () => {
      let sql =       `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
                      FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id`;
      connection.promise().query(sql) 
      .then((response) => {
        let employeeNamesArray = [];
        response[0].forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);
      });
        
  
        let sql =     `SELECT role.id, role.title FROM role`;
        connection.promise().query(sql)
        .then((response) => {
          let rolesArray = [];
          response[0].forEach((role) => {rolesArray.push(role.title);
          });
  
          inquirer
            .prompt([
              {
                name: 'chosenEmployee',
                type: 'list',
                message: 'Which employee has a new role?',
                choices: employeeNamesArray
              },
              {
                name: 'chosenRole',
                type: 'list',
                message: 'What is their new role?',
                choices: rolesArray
              }
            ])
            .then((answer) => {
              let newTitleId, employeeId;
  
              response.forEach((role) => {
                if (answer.chosenRole === role.title) {
                  newTitleId = roles.id;
                }
              });
  
              response.forEach((employee) => {
                if (
                  answer.chosenEmployee ===
                  `${employee.first_name} ${employee.last_name}`
                ) {
                  employeeId = employee.id;
                }
              });
  
              let sqls =    `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
              connection.query(
                sqls,
                [newTitleId, employeeId],
                (error) => {
                  if (error) throw error;
                 console.log(`Employee Role Updated`);
                 promptUser();
                }
              );
            });
        });
      });
    
    };

    // Delete an Employee
  const removeEmployee = () => {
    let sql =     `SELECT employee.id, employee.first_name, employee.last_name FROM employee`;

    connection.promise().query(sql)
    .then((response) => {
      let employeeNamesArray = [];
      response[0].forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

      inquirer
        .prompt([
          {
            name: 'chosenEmployee',

            type: 'list',
            message: 'Which employee would you like to remove?',
            choices: employeeNamesArray
          }
        ])
        .then((answer) => {
          let employeeId;

          response.forEach((employee) => {
            if (
              answer.chosenEmployee ===
              `${employee.first_name} ${employee.last_name}`
            ) {
              employeeId = employee.id;
            }
          });

          let sql = `DELETE FROM employee WHERE employee.id = ?`;
          connection.query(sql, [employeeId], (error) => {
            if (error) throw error;
            console.log(`Employee Successfully Removed`);
            viewAllEmployees();
          });
        });
    });
  };
  promptUser();