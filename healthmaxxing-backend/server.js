const express = require("express")
const cors = require("cors")
const sqlite3 = require("sqlite3").verbose()
const bcrypt = require("bcryptjs")
const { v4: uuidv4 } = require("uuid")
const session = require("express-session")
const SQLiteStore = require("connect-sqlite3")(session)

const app = express()
const PORT = process.env.PORT || 3000

// Configuración de CORS mejorada para sessions
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5500", "http://127.0.0.1:5500"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "authorization"],
  }),
)

// Middleware para parsear JSON
app.use(express.json())

// Configuración de sessions
app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.db",
      dir: "./healthmaxxing-backend",
    }),
    secret: "healthmaxxing-secret-key-2024",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true solo en HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  }),
)

// Servir archivos estáticos
app.use(express.static("."))

// Inicializar base de datos
const db = new sqlite3.Database("./healthmaxxing-backend/users.db")

// Crear tablas si no existen
db.serialize(() => {
  // Tabla de usuarios
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`)

  // Tabla de rutinas
  db.run(`CREATE TABLE IF NOT EXISTS routines (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        routine TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`)

  // Tabla de progreso
  db.run(`CREATE TABLE IF NOT EXISTS progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date DATE NOT NULL,
        weight REAL,
        steps INTEGER,
        water_intake REAL,
        workout_completed BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`)
})

// Middleware de autenticación
function requireAuth(req, res, next) {
  console.log("Verificando autenticación...")
  console.log("Session ID:", req.sessionID)
  console.log("Session data:", req.session)

  if (req.session && req.session.userId) {
    console.log("Usuario autenticado:", req.session.userId)
    next()
  } else {
    console.log("Usuario no autenticado")
    res.status(401).json({ error: "No autorizado" })
  }
}

// Rutas de autenticación

// Registro
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    console.log("Intento de registro:", { name, email })

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son requeridos" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" })
    }

    // Verificar si el usuario ya existe
    db.get("SELECT id FROM users WHERE email = ?", [email], async (err, row) => {
      if (err) {
        console.error("Error verificando usuario:", err)
        return res.status(500).json({ error: "Error interno del servidor" })
      }

      if (row) {
        return res.status(400).json({ error: "El email ya está registrado" })
      }

      // Crear nuevo usuario
      const userId = uuidv4()
      const hashedPassword = await bcrypt.hash(password, 10)

      db.run(
        "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
        [userId, name, email, hashedPassword],
        (err) => {
          if (err) {
            console.error("Error creando usuario:", err)
            return res.status(500).json({ error: "Error creando usuario" })
          }

          // Crear sesión
          req.session.userId = userId
          req.session.userName = name
          req.session.userEmail = email

          console.log("Usuario registrado exitosamente:", userId)
          res.json({
            message: "Usuario registrado exitosamente",
            user: { id: userId, name, email },
          })
        },
      )
    })
  } catch (error) {
    console.error("Error en registro:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    console.log("Intento de login:", email)

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" })
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) {
        console.error("Error buscando usuario:", err)
        return res.status(500).json({ error: "Error interno del servidor" })
      }

      if (!user) {
        return res.status(401).json({ error: "Credenciales inválidas" })
      }

      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return res.status(401).json({ error: "Credenciales inválidas" })
      }

      // Crear sesión
      req.session.userId = user.id
      req.session.userName = user.name
      req.session.userEmail = user.email

      console.log("Login exitoso para usuario:", user.id)
      res.json({
        message: "Login exitoso",
        user: { id: user.id, name: user.name, email: user.email },
      })
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Logout
app.post("/api/logout", (req, res) => {
  console.log("Cerrando sesión para usuario:", req.session?.userId)
  req.session.destroy((err) => {
    if (err) {
      console.error("Error cerrando sesión:", err)
      return res.status(500).json({ error: "Error cerrando sesión" })
    }
    res.clearCookie("connect.sid")
    res.json({ message: "Sesión cerrada exitosamente" })
  })
})

// Obtener información del usuario
app.get("/api/user", requireAuth, (req, res) => {
  console.log("Obteniendo información del usuario:", req.session.userId)

  db.get("SELECT id, name, email, created_at FROM users WHERE id = ?", [req.session.userId], (err, user) => {
    if (err) {
      console.error("Error obteniendo usuario:", err)
      return res.status(500).json({ error: "Error interno del servidor" })
    }

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    res.json(user)
  })
})

// Rutas de rutinas

// Obtener rutinas del usuario
app.get("/api/routines", requireAuth, (req, res) => {
  console.log("Obteniendo rutinas para usuario:", req.session.userId)

  db.all("SELECT * FROM routines WHERE user_id = ? ORDER BY created_at DESC", [req.session.userId], (err, rows) => {
    if (err) {
      console.error("Error obteniendo rutinas:", err)
      return res.status(500).json({ error: "Error obteniendo rutinas" })
    }

    const routines = rows.map((row) => ({
      ...row,
      routine: JSON.parse(row.routine),
    }))

    res.json({ routines })
  })
})

// Obtener rutina específica
app.get("/api/routines/:id", requireAuth, (req, res) => {
  const routineId = req.params.id
  console.log("Obteniendo rutina:", routineId)

  db.get("SELECT * FROM routines WHERE id = ? AND user_id = ?", [routineId, req.session.userId], (err, row) => {
    if (err) {
      console.error("Error obteniendo rutina:", err)
      return res.status(500).json({ error: "Error obteniendo rutina" })
    }

    if (!row) {
      return res.status(404).json({ error: "Rutina no encontrada" })
    }

    const routine = {
      ...row,
      routine: JSON.parse(row.routine),
    }

    res.json(routine)
  })
})

// Marcar rutina como completada
app.post("/api/routines/:id/complete", requireAuth, (req, res) => {
  const routineId = req.params.id
  console.log("Marcando rutina como completada:", routineId)

  db.run(
    "UPDATE routines SET completed = TRUE WHERE id = ? AND user_id = ?",
    [routineId, req.session.userId],
    function (err) {
      if (err) {
        console.error("Error completando rutina:", err)
        return res.status(500).json({ error: "Error completando rutina" })
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: "Rutina no encontrada" })
      }

      res.json({ message: "Rutina marcada como completada" })
    },
  )
})

// Chat con IA (simulado)
app.post("/api/chat", requireAuth, (req, res) => {
  try {
    const { message } = req.body
    console.log("Mensaje de chat recibido:", message)

    if (!message) {
      return res.status(400).json({ error: "Mensaje requerido" })
    }

    // Detectar si el usuario quiere crear una rutina
    const routineKeywords = ["rutina", "ejercicio", "entrenamiento", "workout", "plan"]
    const isRoutineRequest = routineKeywords.some((keyword) => message.toLowerCase().includes(keyword))

    if (isRoutineRequest) {
      // Crear una rutina de ejemplo
      const sampleRoutine = {
        meta: {
          goal: "Rutina de Fuerza Personalizada",
          description: "Rutina diseñada para mejorar fuerza y resistencia muscular",
          duration: "4 semanas",
          difficulty: "Intermedio",
        },
        days: [
          {
            focus: "Tren Superior",
            exercises: [
              { name: "Press de banca", sets: 4, reps: "8-10", weight: "70kg", notes: "Controla el descenso" },
              { name: "Dominadas", sets: 3, reps: "6-8", weight: "", notes: "Si no puedes, usa banda elástica" },
              { name: "Press militar", sets: 3, reps: "8-10", weight: "40kg", notes: "Mantén el core activo" },
              { name: "Remo con barra", sets: 3, reps: "10-12", weight: "50kg", notes: "Aprieta las escápulas" },
            ],
          },
          {
            focus: "Tren Inferior",
            exercises: [
              { name: "Sentadillas", sets: 4, reps: "10-12", weight: "80kg", notes: "Baja hasta 90 grados" },
              { name: "Peso muerto", sets: 3, reps: "6-8", weight: "100kg", notes: "Mantén la espalda recta" },
              { name: "Zancadas", sets: 3, reps: "12 c/pierna", weight: "20kg", notes: "Alterna las piernas" },
              { name: "Elevaciones de gemelos", sets: 4, reps: "15-20", weight: "60kg", notes: "Contracción completa" },
            ],
          },
          {
            focus: "Cardio y Core",
            exercises: [
              { name: "Burpees", sets: 3, reps: "10", weight: "", notes: "Mantén buen ritmo" },
              { name: "Plancha", sets: 3, reps: "45 seg", weight: "", notes: "Mantén línea recta" },
              { name: "Mountain climbers", sets: 3, reps: "20", weight: "", notes: "Alterna rápido" },
              { name: "Bicicleta abdominal", sets: 3, reps: "20 c/lado", weight: "", notes: "Controla el movimiento" },
            ],
          },
        ],
      }

      // Guardar la rutina en la base de datos
      const routineId = uuidv4()
      db.run(
        "INSERT INTO routines (id, user_id, routine) VALUES (?, ?, ?)",
        [routineId, req.session.userId, JSON.stringify(sampleRoutine)],
        (err) => {
          if (err) {
            console.error("Error guardando rutina:", err)
            return res.status(500).json({ error: "Error guardando rutina" })
          }

          console.log("Rutina creada exitosamente:", routineId)
          res.json({
            response:
              "¡Perfecto! He creado una rutina personalizada para ti. Incluye entrenamiento de tren superior, tren inferior y cardio/core. Puedes verla en la pestaña 'Tu Rutina'. ¿Te gustaría que ajuste algo específico?",
            type: "routine_created",
            routineId: routineId,
          })
        },
      )
    } else {
      // Respuestas generales del chat
      const responses = [
        "¡Excelente pregunta! Para mantener una buena salud, es importante combinar ejercicio regular, una alimentación balanceada y descanso adecuado. ¿En qué área específica te gustaría que te ayude?",
        "Te recomiendo empezar con ejercicios básicos como caminatas, flexiones y sentadillas. La consistencia es más importante que la intensidad al principio. ¿Tienes algún objetivo específico en mente?",
        "Una buena alimentación incluye proteínas magras, carbohidratos complejos, grasas saludables y muchas frutas y verduras. ¿Te gustaría que te ayude a planificar tus comidas?",
        "El descanso es fundamental para la recuperación muscular y la salud mental. Intenta dormir 7-9 horas por noche. ¿Tienes problemas para dormir?",
        "¡Genial que quieras mejorar tu salud! Puedo ayudarte con rutinas de ejercicio, consejos nutricionales, seguimiento de progreso y motivación. ¿Por dónde empezamos?",
      ]

      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      res.json({
        response: randomResponse,
        type: "general",
      })
    }
  } catch (error) {
    console.error("Error en chat:", error)
    res.status(500).json({
      error: "Error procesando mensaje",
      response: "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo más tarde.",
    })
  }
})

// Rutas de progreso

// Obtener progreso del usuario
app.get("/api/progress", requireAuth, (req, res) => {
  console.log("Obteniendo progreso para usuario:", req.session.userId)

  // Datos simulados de progreso
  const progressData = {
    currentWeight: 78.5,
    initialWeight: 82,
    targetWeight: 75,
    weeklyProgress: [
      { week: 1, weight: 82, steps: 6500, workouts: 2 },
      { week: 2, weight: 81.2, steps: 7200, workouts: 3 },
      { week: 3, weight: 80.1, steps: 7800, workouts: 3 },
      { week: 4, weight: 78.5, steps: 8200, workouts: 4 },
    ],
    achievements: [
      { name: "Primera semana completa", date: "2024-01-07", icon: "🏆" },
      { name: "5 días de hidratación", date: "2024-01-12", icon: "💧" },
      { name: "Racha de 5 días", date: "2024-01-15", icon: "🔥" },
    ],
  }

  res.json(progressData)
})

// Ruta principal
app.get("/", (req, res) => {
  res.send(`
    <h1>HealthMaxxingAI Backend</h1>
    <p>Servidor funcionando correctamente con autenticación por sessions</p>
    <p>Funcionalidades disponibles:</p>
    <ul>
      <li>Registro y login de usuarios</li>
      <li>Chat con IA</li>
      <li>Gestión de rutinas</li>
      <li>Seguimiento de progreso</li>
    </ul>
  `)
})

// Manejo de errores
app.use((err, req, res, next) => {
  console.error("Error no manejado:", err.stack)
  res.status(500).json({ error: "Error interno del servidor" })
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor HealthMaxxingAI ejecutándose en http://localhost:${PORT}`)
  console.log("📋 Funcionalidades disponibles:")
  console.log("   - Autenticación con sessions")
  console.log("   - Registro y login de usuarios")
  console.log("   - Chat con IA")
  console.log("   - Gestión de rutinas personalizadas")
  console.log("   - Seguimiento de progreso")
  console.log("🔧 CORS configurado para desarrollo local")
})

// Cierre limpio
process.on("SIGINT", () => {
  console.log("\n🛑 Cerrando servidor...")
  db.close((err) => {
    if (err) {
      console.error("Error cerrando base de datos:", err)
    } else {
      console.log("✅ Base de datos cerrada correctamente")
    }
    process.exit(0)
  })
})
