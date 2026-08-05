fetch('http://backend:3001/projects').then(r => r.text()).then(console.log).catch(console.error);
