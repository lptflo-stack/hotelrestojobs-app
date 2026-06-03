const bcrypt = require('bcryptjs');

async function generateHash(password) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
}

async function main() {
    console.log('-- Utilisateurs de test avec bcrypt hashes');
    console.log('');
    
    const users = [
        { email: 'admin@hotelrestojobs.com', password: 'admin123', role: 'admin', firstName: 'Admin', lastName: 'System' },
        { email: 'employer@hotel.com', password: 'employer123', role: 'employer', firstName: 'Hotel', lastName: 'Manager' },
        { email: 'candidate@email.com', password: 'candidate123', role: 'candidate', firstName: 'John', lastName: 'Doe' }
    ];
    
    for (const user of users) {
        const hash = await generateHash(user.password);
        console.log(`-- ${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
        console.log(`INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) VALUES ('${user.email}', '${hash}', '${user.firstName}', '${user.lastName}', '${user.role}', 1);`);
        console.log('');
    }
}

main();
