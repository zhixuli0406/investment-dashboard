const StockInfoList = (props) => {
    const { stockInfo, stockInfoList, orderbook, askVolKValue, bidVolKValue } = props
    function round(num) {
        var m = Number((Math.abs(num) * 100).toPrecision(15));
        return Math.round(m) / 100 * Math.sign(num);
    }
    return (
        <>
            <div className='Fx(n) Bxz(bb)'>
                <ul className='D(f) Fld(c) Flw(w) H(192px) Pstart(0px) Mt(0)'>
                    {
                        stockInfoList.map((item) => (
                            <li className="price-detail-item H(32px) Mx(16px) D(f) Jc(sb) Ai(c) Bxz(bb) Px(0px) Py(4px) Bdbs(s) Bdbc($bd-primary-divider) Bdbw(1px)">
                                <span className="C(#232a31) Fz(16px)--mobile Fz(14px)">{item.text}</span>
                                <span className="Fw(600) Fz(16px)--mobile Fz(14px) D(f) Ai(c)" style={{ color: item.color }}>{item.value}</span>
                            </li>
                        ))
                    }
                </ul>
            </div>
            <div className="Mt(12px) Mx(16px)">
                <div className="D(f) Jc(sb) Ai(c) Mb(4px) Fz(16px)--mobile Fz(14px)">
                    <div className="C(#232a31) Fw(b)">
                        <span>內盤</span>
                        <span className="Mstart(5px) C($c-trend-down)">{stockInfo.inMarket}
                            <span className="Fw(n)">{`(${round(stockInfo.inMarket / (stockInfo.inMarket + stockInfo.outMarket) * 100)}%)`}</span>
                        </span>
                    </div>
                    <div className="C(#232a31) Fw(b)">
                        <span className="Mend(5px) C($c-trend-up)">{stockInfo.outMarket}
                            <span className="Fw(n)">{`(${round(stockInfo.outMarket / (stockInfo.inMarket + stockInfo.outMarket) * 100)}%)`}</span>
                        </span>
                        <span>外盤</span>
                    </div>
                </div>
                <div className="D(f) Jc(sb)">
                    <div className="H(8px) Mend(1px) Bgc($c-trend-down) Bdrsbstart(6px) Bdrststart(6px)" style={{ width: `${round(stockInfo.inMarket / (stockInfo.inMarket + stockInfo.outMarket) * 100)}%` }}></div>
                    <div className="H(8px) Mstart(1px) Bgc($c-trend-up) Bdrsbend(6px) Bdrstend(6px)" style={{ width: `${round(stockInfo.outMarket / (stockInfo.inMarket + stockInfo.outMarket) * 100)}%` }}></div>
                </div>
            </div>
            <div className='Mt(24px) Mx(16px)'>
                <div className='D(f)'>
                    <div className='W(50%) Bxz(bb)'>
                        <div className="D(f) Jc(sb) Ai(c) Mstart(0) Mend(16px) C(#232a31) Fz(16px)--mobile Fz(14px) Pb(4px) Bdbw(1px) Bdbs(s) Bdbc($bd-primary-divider)">
                            <span>量</span>
                            <span>委買價</span>
                        </div>
                        <div className='D(f) Jc(sb) Ai(c) Py(6px) Pstart(0px) Pend(16px)'>
                            <div className='Flxg(2)'>
                                {
                                    orderbook.map((item) => (
                                        <div className='Pos(r) D(f) Ai(c) H(28px) C(#232a31) Fz(16px)--mobile Fz(14px) Pstart(0px) Pend(0px) Mend(4px) Jc(fs)'>
                                            <div className='Pos(a) H(20px) Bgc(#7dcbff) Op(0.5) Bdrs(4px) End(0)' style={{ width: `${item.bidVolK / bidVolKValue * 100}%` }}></div>
                                            {item.bidVolK}
                                        </div>
                                    ))
                                }
                            </div>
                            <div className='D(f) Fld(c) Ai(fe)'>
                                {
                                    orderbook.map((item) => (
                                        <div className='D(f) Ai(c) H(28px)'>
                                            <span className='Fw(n) Fz(16px)--mobile Fz(14px) D(f) Ai(c) C($c-trend-down)'>{item.bid}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <div className='D(f) Jc(sb) Ai(c) Mstart(0) Mend(16px) C(#232a31) Fz(16px)--mobile Fz(14px) Pt(4px) Bdtw(1px) Bdts(s) Bdtc($bd-primary-divider)'>
                            {bidVolKValue}
                            <span>小計</span>
                        </div>
                    </div>
                    <div className='W(50%) Bxz(bb)'>
                        <div className="D(f) Jc(sb) Ai(c) C(#232a31) Fz(16px)--mobile Fz(14px) Pb(4px) Bdbw(1px) Bdbs(s) Bdbc($bd-primary-divider) Mstart(16px) Mend(0)">
                            <span>委賣價</span>
                            <span>量</span>
                        </div>
                        <div className='D(f) Jc(sb) Ai(c) Py(6px) Pstart(16px) Pend(0px)'>
                            <div className='D(f) Fld(c) Ai(fe)'>
                                {
                                    orderbook.map((item) => (
                                        <div className='D(f) Ai(c) H(28px)'>
                                            <span className='Fw(n) Fz(16px)--mobile Fz(14px) D(f) Ai(c) C($c-trend-down)'>{item.ask}</span>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className='Flxg(2)'>
                                {
                                    orderbook.map((item) => (
                                        <div className='Pos(r) D(f) Ai(c) H(28px) C(#232a31) Fz(16px)--mobile Fz(14px) Pstart(0px) Pend(0px) Mstart(4px) Jc(fe)'>
                                            <div className='Pos(a) H(20px) Bgc(#7dcbff) Op(0.5) Bdrs(4px) Start(0)' style={{ width: `${item.askVolK / askVolKValue * 100}%` }}></div>
                                            {item.askVolK}
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <div className='D(f) Jc(sb) Ai(c) C(#232a31) Fz(16px)--mobile Fz(14px) Pt(4px) Bdtw(1px) Bdts(s) Bdtc($bd-primary-divider) Mstart(16px) Mend(0)'>
                            <span>小計</span>
                            {askVolKValue}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default StockInfoList;