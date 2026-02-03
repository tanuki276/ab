module.exports = {
  // アプリケーション設定
  app: {
    name: 'Nyanko Wars Server',
    version: '1.0.0',
    description: 'ねこせんそうサーバー',
    author: 'Nyanko Team',
    contact: 'dev@nyankowars.com',
    license: 'MIT',
    repository: 'https://github.com/nyankowars/server'
  },
  
  // サーバー設定
  server: {
    port: process.env.PORT || 8080,
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
    apiPrefix: '/api',
    apiVersion: 'v1',
    maxRequestBodySize: '10mb',
    trustProxy: true,
    
    // セキュリティ設定
    security: {
      rateLimitWindowMs: 15 * 60 * 1000, // 15分
      rateLimitMax: 100, // 各IPからの最大リクエスト数
      corsOrigins: process.env.CORS_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'http://localhost:8081',
        'https://nyankowars.com'
      ],
      helmetEnabled: true,
      hstsEnabled: true,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      }
    }
  },
  
  // データベース設定
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/nyankowars',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
        maxPoolSize: 10,
        minPoolSize: 2,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
        family: 4
      }
    },
    
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: process.env.REDIS_DB || 0,
      keyPrefix: 'nyankowars:'
    },
    
    // コレクション名
    collections: {
      players: 'players',
      cats: 'cats',
      battles: 'battles',
      items: 'items',
      quests: 'quests',
      achievements: 'achievements',
      gachaLogs: 'gacha_logs',
      shopLogs: 'shop_logs',
      chatMessages: 'chat_messages',
      sessions: 'sessions',
      auditLogs: 'audit_logs'
    }
  },
  
  // 認証設定
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'nyanko-wars-super-secret-key-2024',
      accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '30d',
      refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '90d',
      issuer: 'nyankowars-server',
      audience: 'nyankowars-client'
    },
    
    bcrypt: {
      saltRounds: 10
    },
    
    session: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7日
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }
  },
  
  // ゲーム設定
  game: {
    // リソース設定
    resources: {
      maxEnergy: 100,
      energyRegenPerMinute: 1,
      maxStamina: 50,
      staminaRegenPerMinute: 0.5,
      battleEnergyCost: 10,
      gachaCost: 100
    },
    
    // ガチャ設定
    gacha: {
      rates: {
        normal: 60,
        rare: 25,
        epic: 10,
        legendary: 4,
        mythical: 1
      },
      pitySystem: {
        rareGuarantee: 10,
        epicGuarantee: 50,
        legendaryGuarantee: 100,
        mythicalGuarantee: 500
      }
    },
    
    // バトル設定
    battle: {
      maxTeamSize: 5,
      maxRounds: 20,
      timeoutSeconds: 300,
      expMultiplier: 10,
      pointMultiplier: 5,
      elementAdvantage: 1.5,
      levelAdvantagePerLevel: 0.02
    },
    
    // 経済設定
    economy: {
      startingNyankoPoints: 1000,
      startingGems: 50,
      maxNyankoPoints: 999999999,
      maxGems: 99999,
      exchangeRateGemToPoint: 100
    },
    
    // 制限設定
    limits: {
      maxCatsPerPlayer: 200,
      maxItemsPerPlayer: 500,
      maxFriends: 50,
      maxGuildMembers: 100,
      chatCooldownSeconds: 5,
      maxChatMessages: 500,
      battleCooldownSeconds: 10
    }
  },
  
  // 通知設定
  notifications: {
    push: {
      enabled: true,
      providers: ['fcm'],
      batchSize: 100,
      retryAttempts: 3
    },
    
    email: {
      enabled: process.env.EMAIL_ENABLED === 'true',
      provider: process.env.EMAIL_PROVIDER || 'smtp',
      from: process.env.EMAIL_FROM || 'noreply@nyankowars.com',
      templates: {
        welcome: 'welcome',
        passwordReset: 'password_reset',
        battleResult: 'battle_result',
        gachaResult: 'gacha_result'
      }
    }
  },
  
  // ログ設定
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIR || './logs',
    maxFiles: '30d',
    format: 'combined',
    
    // 監査ログ
    audit: {
      enabled: true,
      logLevel: 'info',
      events: [
        'player.login',
        'player.logout',
        'player.register',
        'player.update',
        'gacha.perform',
        'battle.start',
        'battle.end',
        'shop.purchase',
        'admin.action'
      ]
    }
  },
  
  // キャッシュ設定
  cache: {
    enabled: true,
    defaultTTL: 300, // 5分
    maxKeys: 10000,
    
    // キャッシュキープレフィックス
    prefixes: {
      player: 'player',
      cat: 'cat',
      battle: 'battle',
      leaderboard: 'leaderboard',
      config: 'config'
    }
  },
  
  // スケジューラ設定
  scheduler: {
    enabled: true,
    jobs: [
      {
        name: 'energyRegen',
        cron: '*/5 * * * *', // 5分ごと
        description: 'エネルギー自動回復'
      },
      {
        name: 'dailyReset',
        cron: '0 4 * * *', // 毎日4時
        description: 'デイリーリセット'
      },
      {
        name: 'weeklyReset',
        cron: '0 4 * * 1', // 月曜日4時
        description: 'ウィークリーリセット'
      },
      {
        name: 'cleanupExpiredSessions',
        cron: '0 0 * * *', // 毎日0時
        description: '期限切れセッションのクリーンアップ'
      }
    ]
  },
  
  // 監視設定
  monitoring: {
    enabled: true,
    healthCheckInterval: 30000, // 30秒
    metricsPort: process.env.METRICS_PORT || 9090,
    
    alerts: {
      cpuThreshold: 80, // %
      memoryThreshold: 90, // %
      errorRateThreshold: 5, // %
      responseTimeThreshold: 1000 // ms
    }
  },
  
  // 外部サービス設定
  externalServices: {
    payment: {
      stripe: {
        enabled: process.env.STRIPE_ENABLED === 'true',
        publicKey: process.env.STRIPE_PUBLIC_KEY,
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
      }
    },
    
    analytics: {
      googleAnalytics: {
        enabled: process.env.GA_ENABLED === 'true',
        trackingId: process.env.GA_TRACKING_ID
      },
      amplitude: {
        enabled: process.env.AMPLITUDE_ENABLED === 'true',
        apiKey: process.env.AMPLITUDE_API_KEY
      }
    },
    
    storage: {
      s3: {
        enabled: process.env.S3_ENABLED === 'true',
        bucket: process.env.S3_BUCKET,
        region: process.env.S3_REGION,
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
      }
    }
  },
  
  // デバッグ設定
  debug: {
    enabled: process.env.NODE_ENV === 'development',
    logQueries: false,
    logRequests: true,
    logResponses: false,
    slowQueryThreshold: 100, // ms
    testMode: process.env.TEST_MODE === 'true'
  }
};