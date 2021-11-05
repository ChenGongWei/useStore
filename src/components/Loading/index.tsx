
import React from 'react'
import style from './style.module.scss'

interface LoadingProps {
    style?: React.CSSProperties
}

const Loading: React.FC<LoadingProps> = props => {
    return (
        <div
            style={{
                textAlign: 'center',
                ...(props.style || {}),
            }}>
            <div className={style.ldsRipple}>
                <div></div>
                <div></div>
            </div>
        </div>
    )
}

export default React.memo(Loading)
