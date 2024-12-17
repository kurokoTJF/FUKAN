// ステージのコリジョン構成

function array_parse2D(_array,_width=tiled_width){
	const rows = []
	for (let i = 0; i < _array.length; i += _width) {
	    rows.push(_array.slice(i, i + _width))
	}
	return rows
}



function generate_from_array2D(_array2d,_level=level) {
	const _objects = []
	
    _array2d.forEach((row, _y) => {
        row.forEach((index, _x) => {
			switch(index){
				case 94:
				case 95:
					terrain.push(new Tiles({
							position: {
								x: _x * tile_size,
								y: _y * tile_size
							},

							ID: 0,
						}))
					break
				case 62:
					objects.push(new Tiles({
                        position: {
                            x: _x * tile_size,
                            y: _y * tile_size
                        },
                        ID: 1, // ID
                        expand: {
                            x: tile_size,
                            y: tile_size
                        }
                    }))
					break
				case 63:
					objects.push(new Tiles({
                        position: {
                            x: _x * tile_size,
                            y: _y * tile_size
                        },
                        ID: 2,
                        movieClips: {
                            ex: {
                                imgSrc: './Sprites/vfx/explode.png',
                                frameLength: 14,
                                frameBuffer: 5,
                                nextClip: 'explode',
                                scale: {
                                    x: 2,
                                    y: 2
                                },
                                offset: offset_tile_center(64, 2),

                            }, //expand
                        },
                    }))
					break
				case 1:
					objects.push(new Tiles({
                        position: {
                            x: _x * tile_size,
                            y: _y * tile_size
                        },

                        ID: 3,// next level
						nextLevel:_level+1,

                    }))
					break
				case 2:
					objects.push(new Tiles({
                        position: {
                            x: _x * tile_size,
                            y: _y * tile_size
                        },

                        ID: 3,// previous level
						nextLevel:level-1,

                    }))
					break
				
				case 5: // static+image(floor2)
					terrain.push(init_Tiles(_x,_y,'./Sprites/isometric_tileset/separated/tile_15F.png',2,'iso 1',5))
					break
				case 6: // static+image(flower)
					objects.push(init_Tiles(_x,_y,'./Sprites/isometric_tileset/separated/tile_044.png',2,'iso 1',5))
					break
				case 7:
					objects.push(init_Tiles(_x,_y,'./Sprites/isometric_tileset/separated/tile (4).png',2,'iso 1',5))
					break
				case 8:					
					objects.push(init_Tiles(_x,_y,'./Sprites/isometric_tileset/separated/tile (3).png',2,'iso 1',5))
					break
			}
        })
    })
}






const floorCollisions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 95, 95, 0, 0, 0, 0, 0, 0, 1,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 95, 95, 0, 0, 0, 0, 0, 94, 94,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 95, 95, 95, 0, 0, 0, 0, 0, 94, 94,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 95, 95, 95, 0, 0, 0, 0, 0, 94, 94,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 95, 95, 95, 95, 94, 94, 94, 0, 94, 94,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94, 94,
    0, 0, 0, 0, 0, 63, 0, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 94, 94,
    0, 2, 0, 0, 0, 63, 62, 63, 0, 0, 0, 0, 0, 0, 63, 0, 0, 0, 94, 94,
    94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94]

const level2Collisions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95,
    95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95, 95]