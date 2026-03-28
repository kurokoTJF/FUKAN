# FUKAN
俯瞰プロジェクト

小出しで作って、後で統合する

フェーズ１：新規Classでまとめて、参照を渡して、GMに回してもらう
フェーズ２：Classを統合して整理整頓

https://www.notion.so/Project-Fukan-Manual-15ff521b773280ae9cb2eb56bcb2a2d2?showMoveTo=true

GameManager
 ├─ BlockWorld
 ├─ TPSPlayer_PhysicController
 │   ├─ Camera (PlayerCameraRCV)
 │   ├─ World
 │   ├─ Renderer
 │   ├─ EventHub / GameManager.emitEvent
 │   └─ global keys
 ├─ PlayerCameraRCV
 │   ├─ Player
 │   └─ World
 ├─ PlayerVisualSprite
 │   ├─ Player
 │   ├─ Camera
 │   └─ SpriteRCV / RendererRCV
 ├─ EnemyDummy
 │   ├─ Camera
 │   ├─ Target(Player)
 │   └─ SpriteRCV
 ├─ PhysicSimulator_BlockWorld
 │   └─ BlockWorld / eventID.ResolveMovement
 ├─ FPSInteractor
 └─ BlockBuilder
