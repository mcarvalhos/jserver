const jsonServer = require("json-server");
const cors = require("cors");
const { Low } = require("lowdb");
const { Memory } = require("lowdb/node"); // adapter em memória

const server = jsonServer.create();
server.use(cors());
server.use(jsonServer.bodyParser);

// Adapter em memória
const adapter = new Memory();
const db = new Low(adapter);

// Banco inicial
db.data = {
  "users": [
    {
      "id": 1,
      "login": "stark",
      "password": "123456",
      "name": "Tony Stark",
      "email": "tony.stark@starkindustries.com",
      "avatar": "https://wallpaperaccess.com/full/2330391.jpg",
      "role": "admin"
    },
    {
      "id": 2,
      "login": "miranha",
      "password": "654321",
      "name": "Peter Parker",
      "email": "miranha@avengers.com",
      "avatar": "https://wallpaperaccess.com/full/439967.jpg",
      "role": "user"
    }
  ],
  "contracts": [
    {
      "id": 1,
      "title": "Contrato Alpha",
      "ownerId": 1,
      "status": "ativo"
    },
    {
      "id": 2,
      "title": "Contrato Beta",
      "ownerId": 2,
      "status": "pendente"
    }
  ]
};

// 🔑 Rota fake de login
server.post("/login", async (req, res) => {
  const { login, password } = req.body;
  const user = db.data.users.find(u => u.login === login && u.password === password);

  if (user) {
    return res.json({
      success: true,
      token: "fake-jwt-token-123456",
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    });
  }

  res.status(401).json({ success: false, message: "Usuário ou senha inválidos" });
});

// Protege rotas com token fake (exemplo: /contracts)
server.use((req, res, next) => {
  if (req.path.startsWith("/contracts")) {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== "Bearer fake-jwt-token-123456") {
      return res.status(401).json({ message: "Não autorizado" });
    }
  }
  next();
});

// Rotas GET padrão (leitura)
server.get("/users", (req, res) => {
  res.json(db.data.users);
});

server.get("/contracts", (req, res) => {
  res.json(db.data.contracts);
});

// Opcional: POST, PUT, DELETE funcionam em memória
server.post("/users", (req, res) => {
  const newUser = { id: db.data.users.length + 1, ...req.body };
  db.data.users.push(newUser);
  res.json(newUser);
});

server.listen(process.env.PORT || 3000, () => {
  console.log("🚀 API rodando (em memória)!");
});
