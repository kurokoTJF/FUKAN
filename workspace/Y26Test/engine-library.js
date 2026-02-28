
class SpriteAsset extends GameObject {
    constructor(px = 0, py = 0, pz = 0, height = 1, sprite = { tex: checkerTex, size: 32, color: 'white' }, inverted = false) {
        super('sprite', 'sprite')
        this.localx = px
        this.localy = py
        this.localz = pz
        this.sprite = sprite
        this.inverted = inverted
        this.height = height
    }

    update_self() {

    }
    draw() {

    }
}


class KanbanAsset extends GameObject {
    constructor() {
        super()
        this.id = 'signs'
        this.ax = 12
        this.ay = 9    // 端点A
        this.bx = 13
        this.by = 9    // 端点B
        this.floorZ = 0.0          // 下端高さ（床からのオフセット）
        this.ceilZ = 0.6          // 上端高さ
        this.oneSided = true       // 片面にする？
        this.sprite = {
            tex: Monitor16,
            size: 16,
            color: '#ffd54a'
        }
    }
}
// into GM!



// worldMap, ceilMap, floorMap,skyBoxが必要だなこれは
class WorldArray extends GameObject {
    constructor(worldMap = { map: worldMap32, w: 16, ceilZ: 3 }, ceilMap = { map: ceilMap16, width: 16 }, floorMap = { map: floorMap16, w: 16 }, skyBox = {}) {
        super('worldArray', 'worldArray')
        //デフォルトTextureがほしいんよな
        this.worldMap = worldMap
        this.ceilMap = ceilMap
        this.floorMap = floorMap
        this.skyBox = skyBox

        this.fogColor = [255, 255, 255]// 空色

        this._floorZ = 0
        this._ceilZ = worldMap.ceilZ//これでシーンの高さを変えれる

        //this.tags.add('arrayWorld')
    }

    get map() {
        return this.worldMap.map
    }

    get width() {
        return this.worldMap.w
    }
    get height() {
        return this.worldMap.h ?? this.worldMap.w
    }


    atPos(x, y) {
        return (x < 0 || y < 0 || x >= this.width || y >= this.height) ? 0 : this.map[y * this.width + x] | 0
    }
}

// draw ID: 'sprite'
// 2D Array world[][] 専用！
// Tag player
class RayCasterCamera extends GameObject {
    constructor(_target = null, _world = null, show2D = true, texChecker) {
        super('camera', '2DRayCamera')
        this.px = 15
        this.py = 4
        this.pz = 0
        this.angle = 0
        this.eyeHeight = 0.4
        this.eyeZ = 0.4
        this.FOV = Math.PI / 3// angle of view

        this.sample_width = 4//2 とかちょっと重たくなる
        this.sample_height = 2
        this.followSpeed = 0.04
        this.followDist = 1
        this.followOffset = 0.1
        this.target = _target                // 目線高さ（床=0 からの相対）
        this.world = _world // 見るするworld
        this.sprite_list = []
        this.show2D = show2D
        this.hits = []// the result of rays


        this.defaultTexInfo = {
            tex: checkerTex,
            size: 32,
            wall: true,
        }
    }

    gatherReference(gm) {
        this.GM = gm
        if (!this.target || this.target.deleted || !this.world || this.world.deleted) {
            this.target = null
            this.world = null
            this.GM.objectList.forEach(e => {
                if (e.id == 'worldArray' && !this.world) {
                    this.world = e
                    console.log('[camera] locate a world')
                }
                if (e.id == 'player' && !this.target) {
                    this.target = e
                    console.log('[camera] locate a target')
                }

            })
        }

    }

    update() { // follow the target
        if (!this.target || !this.world) {
            this.updatePause = true
            return showHTML('camera reference not enough', 'camera_channel')
        }

        if (this.target.angle == undefined) {
            this.target.angle = 0
            return showHTML('camera target need angle', 'camera_channel')
        }

        this.angle = this.target.angle
        const
            _dx = -Math.cos(this.angle),
            _dy = -Math.sin(this.angle)

        this.pz = this.target.pz
        this.eyeZ = this.pz + this.eyeHeight
        const
            tx = this.target.px + _dx * this.followDist + _dy * this.followOffset,
            ty = this.target.py + _dy * this.followDist - _dx * this.followOffset

        const deltaX = tx - this.px
        const deltaY = ty - this.py

        if (Math.abs(deltaX) > 0.01)
            this.px += (deltaX) * this.followSpeed
        else
            this.px = tx
        if (Math.abs(deltaY) > 0.01)
            this.py += (deltaY) * this.followSpeed
        else
            this.py = ty
    }

    draw() {

        // target check
        // draw BG
        // z-buffer reset
        // cast 2D ray for loop 
        //    check and draw wall, ceil, floor
        //    check and draw sprites  
        if (!this.world) return

        // draw canvas 2
        if (this.show2D)
            this.Render2DView()


        const dot = (a, b) => a.x * b.x + a.y * b.y
        const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y })
        const cross = (a, b) => a.x * b.y - a.y * b.x



        // --- draw background ---

        // z-buffer reset
        if (!this.zbuf || this.zbuf.length !== W) this.zbuf = new Float32Array(W)
        this.zbuf.fill(Infinity)

        // FOV フレームごとに更新が必要
        // FocalLengthは、画面と焦点の垂直距離?
        const FocalLength = this.getFocalLength()

        // draw World
        for (let _x = -1/* 0だと中央がなぜかバグる */; _x < W; _x += this.sample_width) {


            const ray_angle = (_x / W - 0.5) * this.FOV; // (-0.5~0.5) *FOV
            const true_ray_angle = this.angle + ray_angle
            const
                dx = Math.cos(true_ray_angle),
                dy = Math.sin(true_ray_angle) // all in canvas coordination, inverted y!

            // DDA the wall（原点オフセットで自己衝突回避）
            const hit = this.raycast2D(this.px + dx * 1e-4, this.py + dy * 1e-4, dx, dy)

            if (this.show2D) {
                const sizew = w0 / this.world.width
                const sizeh = h0 / this.world.height

                drawLine(
                    c2,
                    sizew * (this.px + dx * 1e-4),
                    sizew * (this.py + dy * 1e-4),
                    sizew * (this.px + dx * hit.dist),
                    sizew * (this.py + dy * hit.dist),
                    'white', 1
                )
            }


            // ⊥距離（魚眼補正 Ver
            const perpDistance = Math.max(1e-6, hit.dist * Math.cos(ray_angle))


            // 列が sample_width ピッチなので、該当する画面xに深度を入れておく
            for (let _xi = _x; _xi < Math.min(W, _x + this.sample_width); _xi++) {
                // 近いもの優先で最小を保持
                if (perpDistance < this.zbuf[_xi]) this.zbuf[_xi] = perpDistance
            }

            // ★ 正しい投影：上端/下端を別々に計算
            const wallTop = (H / 2) - ((this.world._ceilZ - this.eyeZ) * FocalLength) / perpDistance
            const wallBot = (H / 2) + ((this.eyeZ - this.world._floorZ) * FocalLength) / perpDistance

            // クリップ
            const y0 = Math.max(0, Math.min(H - 1, wallTop | 0))
            const y1 = Math.max(0, Math.min(H, wallBot | 0))
            const lineH = y1 - y0
            if (lineH <= 0) continue

            const fog_depth = Math.min(1, hit.dist / 16)
            const fog_color = this.world.fogColor


            if (hit.hit) {
                // 色（マテリアル）＋ 面向きで陰
                // ここはまあ、Lightingもできればやってみたいけど

                // 1. get the color 
                // NdotL !!
                const normal = {
                    x: hit.side ? 0 : (hit.dir.x > 0 ? -1 : 1),
                    y: hit.side ? (hit.dir.y > 0 ? -1 : 1) : 0,
                    z: 0
                }
                const shade = Math.max(0, (-dx * normal.x - dy * normal.y + 0 * normal.z))


                let tex_info = { ...this.defaultTexInfo }
                let col = [255, 200, 100]
                if (hit.id == 4) {
                    tex_info.tex = window8
                    tex_info.size = 8
                } else {
                    if (hit.id === 1) {
                        col = [0, 220, 220]
                    }
                    else if (hit.id === 2)
                        col = [230, 210, 30]
                    else if (hit.id === 3) {
                        col = [40, 160, 255]
                        tex_info.tex = Monitor16
                        tex_info.size = 16
                    }

                    C.fillStyle = `rgb(
            ${(this.lerp(fog_depth, col[0] * shade, fog_color[0])) | 0},
            ${(this.lerp(fog_depth, col[1] * shade, fog_color[1])) | 0},
            ${(this.lerp(fog_depth, col[2] * shade, fog_color[2])) | 0})`


                    // 2. fill Rectangle area
                    C.fillRect(_x, y0, this.sample_width, y1 - y0)

                }

                const _wx = this.px + dx * hit.dist; // ヒット世界座標
                const _wy = this.py + dy * hit.dist
                const u =
                    hit.side ?
                        (hit.dir.y < 0 ? _wx - Math.floor(_wx) : 1 - _wx + Math.floor(_wx)) :
                        (hit.dir.x > 0 ? _wy - Math.floor(_wy) : 1 - _wy + Math.floor(_wy))

                if (wallBot < wallTop) return
                const blendFogColor = `rgb(
                            ${this.lerp(fog_depth, col[0] * shade, fog_color[0])},
                            ${this.lerp(fog_depth, col[1] * shade, fog_color[1])},
                            ${this.lerp(fog_depth, col[2] * shade, fog_color[2])})`

                this.UVSampleStrand(
                    tex_info.tex, tex_info.size, blendFogColor,
                    _x, y0, y1,
                    wallTop, wallBot,
                    u)
            } // end of if hit.hit



            // ====== ★ FLOOR CAST: 壁の下の床をサンプリング ======
            // 逆投影の定数（列ごとに一定）
            const Kfloor = (this.eyeZ - this.world._floorZ) * FocalLength; // eyeZから床までのスケール
            if (Kfloor > 0) {

                // 床は y1(=壁下端) から画面下端まで
                // ⊥距離を求めて、実距離を出す、したらRayのVectorにのかってworld座標を出せる。
                // Key: dist = (eyeZ-floorZ)*Focallength/denom
                for (let _y = y1; _y < H; _y += this.sample_height) {
                    // 画面行 y → 垂直距離 d_perp

                    // 1. sample the color
                    const denom = (_y) - H / 2;  // ピクセル中心 (+0.5 推奨)
                    if (denom <= 0) continue
                    const dPerpFloor = Kfloor / denom; // 
                    const dRay = dPerpFloor / Math.cos(ray_angle) // 画面⊥距離から実距離（魚眼補正逆変換）

                    // 世界座標（同じレイ方向）
                    const fx = this.px + dx * dRay
                    const fy = this.py + dy * dRay
                    // タイル繰り返しUV（0..1）
                    const u = fx - Math.floor(fx)
                    const v = fy - Math.floor(fy)
                    const on = this.UVSampling(checkerTex, u, v, 32)

                    const floorID = this.world.atPos(Math.floor(fx), Math.floor(fy))

                    let r = 255, g = 255, b = 133
                    if (floorID == 0) {

                        // 簡単なフォグ（距離で空色へ寄せる）
                        const fog = Math.min(1, dPerpFloor / 16)
                        r = on ? 0 : 10
                        g = on ? 0 : 80
                        b = on ? 0 : 122; // 地面のベース色
                        r = ((1 - fog) * r + fog * fog_color[0]) | 0
                        g = ((1 - fog) * g + fog * fog_color[1]) | 0
                        b = ((1 - fog) * b + fog * fog_color[2]) | 0
                    } else if (floorID == -1) {
                        r = 255, g = 0, b = 0
                    } else if (floorID == -2) {

                    }

                    // 2. fill the rectangle
                    C.fillStyle = `rgb(${r},${g},${b})`
                    C.fillRect(_x, _y, this.sample_width, this.sample_height)
                }// end of draw floor 
            }


            // ====== ★ CEIL CAST: 天井をサンプリング ======
            const CeilOffset = 0
            const KCeil = (this.world._ceilZ + CeilOffset - this.eyeZ) * FocalLength; // eyeZから床までのスケール
            if (KCeil > 0) {

                for (let _y = y0 - this.sample_height; _y > 0; _y -= this.sample_height) {
                    // 画面行 y → 垂直距離 d_perp
                    const denom = H / 2 - (_y);             // ピクセル中心 
                    if (denom <= 0) continue
                    const dPerpFloor = KCeil / denom; // Key: dist = (eyeZ-floorZ)*Focallength/(y-H/2)
                    const dRay = dPerpFloor / Math.cos(ray_angle) // 魚眼補正逆変換
                    //const dRay = dPerpFloor;          

                    // 世界座標（同じレイ方向）からタイル繰り返しUV（0..1）
                    const fx = this.px + dx * dRay
                    const fy = this.py + dy * dRay
                    const u = fx - Math.floor(fx)
                    const v = fy - Math.floor(fy)
                    const sampleCeil = this.UVSampling(ceilMap16, fx / 16, fy / 16, 16)
                    if (sampleCeil > 0) {

                        // 例：32x32のチェッカーからサンプル
                        const on = this.UVSampling(checkerTex, u, v, 32)

                        // 簡単なフォグ（距離で空色へ寄せる）
                        const fog = Math.min(1, dPerpFloor / 16)
                        const col = [10, 10, 10]
                        let r = on ? 122 : col[0], g = on ? 120 : col[1], b = on ? 80 : col[2]; // 地面のベース色
                        r = ((1 - fog) * r + fog * fog_color[0]) | 0
                        g = ((1 - fog) * g + fog * fog_color[1]) | 0
                        b = ((1 - fog) * b + fog * fog_color[2]) | 0

                        C.fillStyle = `rgb(${r},${g},${b})`
                        C.fillRect(_x, _y, this.sample_width, this.sample_height)
                    } else {
                    }
                } // end of Draw ceiling for
            }


            // draw the sprite
            if (_x == -1) {
                this.sprite_list.length = 0
                this.GM.flatDrawList?.forEach(spr => {
                    if (spr.id == 'sprite' || spr.id == 'signs') {
                        this.sprite_list.push(spr)
                    }
                })
            }

            const hit_sprite = this.collectColumnSprites(_x, perpDistance, true_ray_angle, FocalLength)

            const ZNew = this.renderColumnFromHits(_x, hit_sprite, perpDistance, wallTop, wallBot)



        } // end of for render stripes




    }


    // only for billborads and signs


    collectColumnSprites(screen_x, distWall/* 壁は描画されている */, true_ray_angle, FocalLength) {
        this.hits.length = 0
        const hits = this.hits

        const
            ca = Math.cos(this.angle),
            sa = Math.sin(this.angle)
        const
            dir = { x: Math.cos(true_ray_angle), y: Math.sin(true_ray_angle) },
            fwd = { x: Math.cos(this.angle), y: Math.sin(this.angle) }

        // find sprite id from list every ray, kind expensive?
        this.sprite_list.forEach(spr => {
            if (spr.id == 'sprite') {
                const
                    vx = spr.px - this.px,
                    vy = spr.py - this.py
                const depth = vx * ca + vy * sa // dot to get depth
                if (depth <= 1e-4 || depth >= distWall) return //1)out of depth range

                const side = vx * (-sa) + vy * ca

                // camera to screen (the origin is different)
                const _ratio = FocalLength / depth

                const billHeight = (spr.height || 1.0) * _ratio
                const billWidth = billHeight * (spr.aspect || 1.0)

                const sideX = W / 2 + side * _ratio
                const
                    screen_x0 = sideX - billWidth / 2,
                    screen_x1 = sideX + billWidth / 2

                if (screen_x < screen_x0 || screen_x > screen_x1) return //2) ray out of billborad range, 

                let yBot, yTop, y0, y1
                if (!spr.inverted) {
                    yBot = H / 2 + ((this.eyeZ - (spr.pz || 0)) * _ratio)
                    yTop = yBot - billHeight
                } else {
                    yTop = H / 2 + ((this.eyeZ - (spr.pz || 0)) * _ratio)
                    yBot = yTop + billHeight
                    y0 = Math.max(0, Math.min(H - 1, yTop | 0))
                    y1 = Math.max(0, Math.min(H, yBot | 0))

                }

                const sprite = spr.sprite
                const u = (screen_x - screen_x0) / (screen_x1 - screen_x0)
                hits.push({
                    depth: depth,
                    kind: 'sprite',
                    sprite: spr.sprite,
                    yTop: yTop, yBot: yBot,
                    u: u
                })

            }// end of collect sprite
            else if (spr.id == 'signs') {
                const shite = { x: spr.bx - spr.ax, y: spr.by - spr.ay }
                // if(s.oneSided)
                const hitS = this.intersectRaySegment(
                    { x: this.px, y: this.py }, dir,
                    { x: spr.ax, y: spr.ay }, { x: spr.bx, y: spr.by }
                )
                if (!hitS.hit) return

                //
                const Px = this.px + hitS.t * dir.x, Py = this.py + hitS.t * dir.y
                const depth = (Px - this.px) * fwd.x + (Py - this.py) * fwd.y
                if (depth <= 1e-4) return

                const yTop = H / 2 - ((spr.ceilZ - this.eyeZ) * FocalLength) / depth
                const yBot = H / 2 + ((this.eyeZ - spr.floorZ) * FocalLength) / depth

                const sprite = spr.sprite
                const u = hitS.s
                hits.push({
                    depth: depth,
                    kind: 'sign',
                    sprite: spr.sprite,
                    yTop: yTop, yBot: yBot,
                    u: u

                })

            }

        })

        return hits
    }

    renderColumnFromHits(screen_x, hits, zbufX, yTopWall, yBotWall) {
        hits.sort((a, b) => b.depth - a.depth)


        for (const hit of hits) {
            if (hit.depth > zbufX) continue
            let screen_y0 = Math.max(0, hit.yTop | 0)
            let screen_y1 = Math.min(H, hit.yBot | 0)
            if (screen_y1 <= screen_y0) continue

            /*
            const isFront = hit.depth < zbufX
             if (!isFront) {
     
              const A0 = y0, A1 = Math.min(y1, yTopWall | 0)
              const B0 = Math.max(y0, yBotWall | 0), B1 = y1
     
              if (A1 > A0) {
                c.globalAlpha = hit.alpha
                c.fillStyle = hit.color
                c.fillRect(_x, A0, this.sample_width, A1 - A0)
              }
              if (B1 > B0) {
                c.globalAlpha = hit.alpha
                c.fillStyle = hit.color
                c.fillRect(_x, B0, this.sample_width, B1 - B0)
              }
              continue
            }// end of back */



            this.UVSampleStrand(
                hit.sprite?.tex || checkerTex, hit.sprite?.size || 32, hit.sprite?.color || 'white',
                screen_x, screen_y0, screen_y1,
                hit.yTop, hit.yBot,
                hit.u
            )

            zbufX = hit.depth
        }// end of h sample
        return zbufX
    }

    // get full width focal length
    getFocalLength() {
        return (W / 2) / Math.tan(this.FOV / 2)  // 投影スケール
    }

    lerp(k, v1, v2) {
        return (1 - k) * v1 + k * v2
    }

    intersectRaySegment(O, d, A, B) {
        const cross = (a, b) => a.x * b.y - a.y * b.x
        const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y }); /* これは独立させておきたい */
        const e = sub(B, A)
        const denom = cross(d, e)
        if (Math.abs(denom) < 1e-9) return { hit: false }

        const AO = sub(A, O)
        const t = cross(AO, e) / denom;  // レイ側
        const s = cross(AO, d) / denom;  // 線分側(0..1)
        if (t > 1e-6 && s >= 0 && s <= 1) return { hit: true, t, s }

        return { hit: false }
    }

    // u,v (0.0 to 1.0)
    UVSampling(tex, u, v, texSizeX, texSizeY = texSizeX) {
        const U = Math.floor(u * texSizeX)
        const V = Math.floor(v * texSizeY)
        return tex[V * texSizeX + U]
    }

    // draw strand from (_x,y0) to (_x,y1)
    UVSampleStrand(
        _tex, _texSize, _color,
        _x, screen_y0, screen_y1,
        yTop, yBot,
        u,
        dotWidth = this.sample_width, dotHeight = this.sample_height
    ) {
        const strandHeight = screen_y1 - screen_y0
        for (let y = 0; y < strandHeight; y += dotHeight) {
            const v = (screen_y0 + y - yTop) / (yBot - yTop) // FIX!!!
            //const checkerU = Math.floor(u * 32)
            //const checkerV = Math.floor(startV * 32)
            C.save()
            const on = this.UVSampling(_tex, u, v, _texSize)
            if (on == 1) {
                C.fillStyle = _color
                C.fillRect(_x, screen_y0 + y, dotWidth, dotHeight)
            }
            else if (on == 0) {
                C.fillStyle = 'black'
                C.fillRect(_x, screen_y0 + y, dotWidth, dotHeight)
            }

            C.restore()
        }
    }


    raycast2D(ox, oy, dx, dy, maxDist = 32) {
        // start position in grid system
        let mapX = Math.floor(ox), mapY = Math.floor(oy)
        const
            searchDirX = dx > 0 ? 1 : -1, // right or left
            searchDirY = dy > 0 ? 1 : -1; // down or up
        const
            _nextBlockX = mapX + (searchDirX > 0 ? 1 : 0), // 0 for the right side
            _nextBlockY = mapY + (searchDirY > 0 ? 1 : 0); // 0 for the bottom side

        const eps = 1e-9,
            invDx = 1 / (Math.abs(dx) < eps ? eps : dx),
            invDy = 1 / (Math.abs(dy) < eps ? eps : dy)
        const
            tDeltaX = Math.abs(invDx),// 常に一定
            tDeltaY = Math.abs(invDy)
        let
            nextBlockDistByX = (_nextBlockX - ox) * invDx, // tMaxX * Math.cos(ra) = (N-O)
            nextBlockDistByY = (_nextBlockY - oy) * invDy

        // check if inside、これはいなくてもいいな
        /* const id0 = this.world.atPos(mapX, mapY)
        if (id0) return {
          hit: true, dist: 0, id: id0,
          side: 0, dir: { x: searchDirX, y: searchDirY },
          cellX: mapX, cellY: mapY
        }; */

        let side = 0, dist = 0, hitId = 0
        for (let i = 0; i < 128; i++) {
            // youtubeのは、XとY方向で全部終わってから比較する、こっちは交互でやる
            // move the check block position, update the dist
            if (nextBlockDistByX <= nextBlockDistByY) {
                mapX += searchDirX
                dist = nextBlockDistByX
                nextBlockDistByX += tDeltaX
                side = 0
            }
            else {
                mapY += searchDirY
                dist = nextBlockDistByY
                nextBlockDistByY += tDeltaY
                side = 1
            }

            if (dist > maxDist) break

            hitId = this.world.atPos(mapX, mapY)
            if (hitId > 0 && dist > this.followDist)
                return {
                    hit: true, dist, id: hitId,
                    side, dir: { x: searchDirX, y: searchDirY },
                    cellX: mapX, cellY: mapY
                }
        }

        // no hit
        return {
            hit: false, dist: maxDist, id: 0,
            side: 0, dir: { x: searchDirX, y: searchDirY },
            cellX: -1, cellY: -1
        }

    }
    Render2DView() {
        let target_px = 0, target_py = 0, target_angle = 0
        if (this.target) {
            target_px = this.target.px
            target_py = this.target.py
            target_angle = this.target.angle
        } else {
            target_px = this.px
            target_py = this.py
            target_angle = this.angle
        }
        c2.fillStyle = 'grey'
        c2.fillRect(0, 0, w0, h0)
        const sw = w0 / this.world.width
        const sh = h0 / this.world.height
        for (let y = 0; y < this.world.height; y++) for (let x = 0; x < this.world.width; x++) {
            const on = this.world.atPos(x, y)
            if (on > 0) {
                c2.fillStyle = 'black'
                c2.fillRect(x * sw + 1, y * sh + 1, sw - 1, sh - 1)
            } else if (on == -1) {
                c2.fillStyle = 'red'
                c2.fillRect(x * sw + 1, y * sh + 1, sw - 1, sh - 1)

            } else if (on == -2) {
                c2.fillStyle = 'yellow'
                c2.fillRect(x * sw + 1, y * sh + 1, sw - 1, sh - 1)

            }
        }


        const arraylength = 20
        const targetsizex = 20 // なるべくDecouplingしたい！
        c2.beginPath()
        c2.arc(target_px * sw, target_py * sh, targetsizex / 2, 0, 2 * Math.PI)
        c2.fillStyle = "red"
        c2.fill()

        c2.beginPath()
        c2.arc(this.px * sw, this.py * sh, targetsizex / 2, 0, 2 * Math.PI)
        c2.fillStyle = "yellow"
        c2.fill()

        this.GM.flatDrawList?.forEach(e => {
            if (e.id == 'sprite') {
                c2.beginPath()
                c2.arc(e.px * sw, e.py * sh, targetsizex / 2, 0, 2 * Math.PI)
                c2.fillStyle = "blue"
                c2.fill()
            }

        })


        drawLine(c2,
            target_px * sw,
            target_py * sh,
            target_px * sw + arraylength * Math.cos(target_angle),
            target_py * sh + arraylength * Math.sin(target_angle)
        )

    }

}

// need target to follow the angle
class PanoramaBG extends GameObject {
    constructor(url, target) {
        super('PanoramaBG', 'PanoramaBG')
        this.iml = new ImageLoader(url)
        this.startOffset = 0
        this.drawLengthPropotion = 0.4
        this.drawHeightPosition = 1
        this.rotateAngle = 0
        this.target = target
        //this.drawPause = true
    }
    gatherReference(gm) {
        if (!this.target) {
            this.master.objectList.forEach(e => {
                if (e.tags?.has('player')) {
                    this.target = e
                    console.log('[]locate a player')
                }
            })
        }
    }
    update() {
        if (this.target)
            this.rotateAngle = this.target.angle

    }
    draw() {
        if (!this.iml.loaded) return
        const img = this.iml.img
        const width = this.iml.img.width
        const height = this.iml.img.height
        const rotation_offset = this.rotateAngle * width / (Math.PI * 2)
        const startPos = this.startOffset % width + rotation_offset

        if (this.drawLengthPropotion < 0 || this.drawLengthPropotion > 1) return
        const drawLength = width * this.drawLengthPropotion
        if (startPos + drawLength > width) {
            const drawLength1 = width - startPos
            const drawEndPos1 = W * drawLength1 / drawLength
            C.drawImage(
                img,
                startPos, 0,
                drawLength1, height * this.drawHeightPosition,
                0, 0,
                drawEndPos1, H * this.drawHeightPosition)
            C.drawImage(
                img,
                0, 0,
                drawLength - drawLength1, height * this.drawHeightPosition,
                drawEndPos1 - 1, 0,
                W - drawEndPos1 + 1, H * this.drawHeightPosition)

        } else {
            C.drawImage(
                img,
                startPos, 0,
                drawLength, height * this.drawHeightPosition,
                0, 0,
                W, H * this.drawHeightPosition)

        }
    }

}

// ゲーム世界がStopMotionなら、これがその「動かす手」になる

// xy平面の回転付きプレイヤー

class Player3DWithRotation extends GameObject {
    constructor() {
        super('player', 'player')
        this.angle = Math.PI / 2
        this.px = 13.5
        this.py = 5.5
        this.pz = 0
        this.deltaX = 0
        this.deltaY = 0
        this.deltaZ = 0
        this.sizex = 10
        this.sizey = 10
        this.moveSpeed = 0.01
        this.rotSpeed = 0.02
        this.world = null
        //this.tags.add('player')
    }

    gatherReference(_root) {
        this.GM = _root
        if (!this.world) {
            this.master.objectList.forEach(e => {
                if (e.id == 'worldArray') {
                    console.log('[player]locate a world')
                    this.world = e
                }
            })
        }
    }
    update_self() {
        //const dt = Math.min(0.033, (now - last) * 0.001)
        //last = now
        if (!this.world) {
            this.updatePause = true
            return console.log('player need world!')
        }

        if (this.angle < 0) {
            this.angle *= -1
            this.angle %= Math.PI * 2
            this.angle = Math.PI * 2 - this.angle
        } else {
            this.angle %= Math.PI * 2
        }
        if (keys == undefined) return console.log('player waiting for key Event')
        const
            _fwdx = Math.cos(this.angle),
            _fwdy = Math.sin(this.angle)
        const
            _rightx = Math.cos(this.angle + Math.PI / 2),
            _righty = Math.sin(this.angle + Math.PI / 2)

        let mx = 0, my = 0
        if (keys.up.pressed) { mx += _fwdx; my += _fwdy; }
        if (keys.down.pressed) { mx -= _fwdx; my -= _fwdy; }
        if (keys.left.pressed) { mx -= _rightx; my -= _righty; }
        if (keys.right.pressed) { mx += _rightx; my += _righty; }

        const mag = Math.hypot(mx, my) || 1
        mx /= mag
        my /= mag

        const step = this.moveSpeed * (keys['AltLeft'] ? 1.7 : 1.0) //* dt

        const npx = this.px + mx * step, npy = this.py + my * step
        const nwx = this.world.atPos(Math.floor(npx), Math.floor(this.py))
        const nwy = this.world.atPos(Math.floor(this.px), Math.floor(npy))
        if (nwx <= 0)
            this.px = npx

        if (nwy <= 0)
            this.py = npy

        if (nwx == -1 && this.pz == 0) {
            GM.pushEvent(eventID.playerDie)
        }
        if (nwy == -1 && this.pz == 0) {
            GM.pushEvent(eventID.playerDie)
        }

        if (nwx == -2 && this.pz == 0) {
            GM.pushEvent(eventID.playerGoal)
        }
        if (nwy == -2 && this.pz == 0) {
            GM.pushEvent(eventID.playerGoal)
        }

        const npz = this.pz + this.deltaZ
        if (npz > 0) {
            this.pz = npz
            this.deltaZ -= 0.001
        } else {
            this.pz = 0
            this.deltaZ = 0
        }


        if (keys.turnLeft.pressed) this.angle -= this.rotSpeed //* dt
        if (keys.turnRight.pressed) this.angle += this.rotSpeed //* dt

    }
}

