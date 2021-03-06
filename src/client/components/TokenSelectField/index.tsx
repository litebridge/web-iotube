import React, { useMemo, useState } from "react";
import "./index.scss";
import { Select } from "antd";
import { InfoCircleOutlined, RightOutlined } from "@ant-design/icons";
import CurrencyLogo from "../CurrencyLogo/index";
import { useTokens } from "../../hooks/Tokens";
import { AllChainId, ETHEREUM, TokenInfoPair } from "../../constants/index";
import { getTokenLink } from "../../utils/index";
import { publicConfig } from "../../../../configs/public";
import { ChainId } from "@uniswap/sdk";
import { useActiveWeb3React } from "../../hooks/index";
import { values } from "mobx";

interface IComponentProps {
  onChange: Function;
  network: string;
  toNetwork?: string;
}

const { Option } = Select;

export const TokenSelectField = (props: IComponentProps) => {
  const { chainId = publicConfig.IS_PROD ? (props.network == "BSC" ? AllChainId.BSC : ChainId.MAINNET) : ChainId.KOVAN } = useActiveWeb3React();
  const { network = ETHEREUM, onChange, toNetwork } = props;
  const tokenList = useTokens(network, toNetwork);
  const [currentVal, setCurrentVal] = useState("");
  const clearValue = useMemo(() => tokenList && currentVal && !tokenList[currentVal], [tokenList, currentVal]);

  return (
    <Select
      key={`token-select-${chainId}`}
      className="component__token_select w-full c-white"
      suffixIcon={<RightOutlined className="c-gray-10 text-base mr-2" />}
      dropdownClassName="component__token_select__dropdown"
      value={clearValue ? null : currentVal}
      onChange={(value: string) => {
        if (tokenList && value) {
          setCurrentVal(value);
        }
        if (tokenList && value && !clearValue) {
          onChange(tokenList[value.toLowerCase()]);
        }
      }}
    >
      {tokenList &&
        Object.keys(tokenList).map((key: string, index) => {
          const tokenInfoPair: TokenInfoPair = tokenList[key];
          return (
            <Option key={key} value={key} className="flex bg-secondary c-white items-center">
              <CurrencyLogo currency={tokenInfoPair[network]} />
              <span className="flex-1 text-xl text-left ml-2 font-thin">{`${tokenInfoPair[network].name}(${tokenInfoPair[network].symbol})`}</span>
              <a href={getTokenLink(network, tokenInfoPair[network].address)} target="_blank">
                <InfoCircleOutlined style={{ color: "#9398A2" }} />
              </a>
            </Option>
          );
        })}
    </Select>
  );
};
