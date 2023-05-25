import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const Search = () => {
    const [stockList, setStockList] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [value, setValue] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        searchStockList();
    }, [inputValue])

    const searchStockList = async () => {
        const response = await axios.get('https://stock-proxy-uyy2ythogq-de.a.run.app/yahoo/v1/finance/search',
            {
                params: {
                    q: inputValue,
                    lang: 'zh-TW',
                    quotesCount: 8,
                }
            }
        );
        setStockList([]);
        setStockList(response.data.quotes);
    }
    useEffect(() => {
        if (value)
            navigate(`/${value.symbol}`)
    }, [value])
    return (
        <Autocomplete
            freeSolo
            id="stock-search"
            disableClearable
            getOptionLabel={(option) =>
                typeof option === 'string' ? option : option.symbol
            }
            filterOptions={(x) => x}
            autoComplete
            includeInputInList
            filterSelectedOptions
            noOptionsText="找不到搜尋的股票"
            options={stockList}
            value={value}
            onChange={(event, newValue) => {
                setValue(newValue);
            }}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="搜尋股票代碼或名稱"
                    fullWidth
                />
            )}
            renderOption={(props, option) => {
                return (
                    <li {...props}>
                        <Grid container alignItems="center">
                            <Grid item sx={{ width: 'calc(100% - 44px)', wordWrap: 'break-word' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={8}>
                                        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                                            {option.symbol}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="body2" color="text.secondary" align="right">
                                            {option.typeDisp}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2}>
                                    <Grid item xs={8}>
                                        <Typography variant="body2" color="text.secondary">
                                            {option.shortname}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography variant="body2" color="text.secondary" align="right">
                                            {option.exchDisp}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </li>
                );
            }}
        />
    )
}

export default Search;