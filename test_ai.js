fetch("http://localhost:3001/ai/chat", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({message:"who is nebil?"})}).then(r=>r.json()).then(console.log)
