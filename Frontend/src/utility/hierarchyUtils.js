export const buildEmployeeTree = (employees) => {
    if (!Array.isArray(employees)) return [];
    
    const map = {};
    const tree = [];
    
    employees.forEach(emp => {
        const rawEmp = emp?.raw || emp;
        const targetId = emp?._id || rawEmp?._id;
        
        if (targetId) {
            let finalName = emp?.name || `${rawEmp?.firstName || ''} ${rawEmp?.lastName || ''}`.trim();
            if (!finalName || finalName === 'Incomplete Name') {
                finalName = rawEmp?.email || 'Unnamed Employee';
            }

            let targetManagerId = null;
            if (rawEmp?.managerId) {
                targetManagerId = typeof rawEmp.managerId === 'object' 
                    ? (rawEmp.managerId._id || rawEmp.managerId.id) 
                    : rawEmp.managerId;
            } else if (emp?.managerId) {
                targetManagerId = typeof emp.managerId === 'object' ? emp.managerId._id : emp.managerId;
            }

            map[targetId] = {
                id: targetId,
                label: `${finalName} (${emp.id || rawEmp?.employeeCode || '—'})`,
                managerId: targetManagerId || null,
                children: []
            };
        }
    });

    Object.values(map).forEach(node => {
        if (node.managerId && map[node.managerId]) {
            map[node.managerId].children.push(node);
        } else {
            tree.push(node); 
        }
    });

    return tree;
};