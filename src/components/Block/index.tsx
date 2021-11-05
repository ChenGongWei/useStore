import React from 'react'
import style from './style.module.scss'

export interface BlockProp {
    /** 标题 */
    title: string
    /** padding间距 */
    padding?: number[]
    /** 背景色 */
    background?: string
}

const Block: React.FC<BlockProp> = props => {
    const { title, children, background, padding = [10] } = props

    return (
        <div
            className={style.box}
            style={{
                padding: padding.map(p => p + 'px').join(' '),
                background: background || '#FFF',
            }}>
            <div className={style.title}>{title}</div>
            {children}
        </div>
    )
}

export default Block
