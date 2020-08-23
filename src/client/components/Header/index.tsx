import React from "react";
import "./index.scss";
import { EllipsisOutlined, CopyOutlined } from "@ant-design/icons";
import { Avatar, Button, notification } from "antd";
import { useStore } from "../../../common/store";
import { useObserver } from "mobx-react";
import "./index.scss";
import { CARD_ERC20_XRC20 } from "../../../common/store/base";
import { shortenAddress } from "../../utils";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import useENSName from "../../hooks/useENSName";
import { useETHBalances } from "../../state/wallet/hooks";
import { Web3Provider } from "@ethersproject/providers";
import { SUPPORTED_WALLETS, ETH_NETWORKS } from "../../constants";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { injected } from "../../connectors";
import { fromRau } from "iotex-antenna/lib/account/utils";
import copy from "copy-to-clipboard";

const IMG_LOGO = require("../../static/images/logo-iotex.png");
const IMG_IOTX = require("../../static/images/icon_wallet.png");
const IMG_ETHER = require("../../static/images/icon-eth.png");

export const Header = () => {
  const { wallet, lang, base } = useStore();
  const { account, activate, chainId } = useWeb3React<Web3Provider>();
  const { ENSName } = useENSName(account);
  const userEthBalance = useETHBalances([account])[account];

  const tryActivation = async (connector) => {
    let name = "";
    Object.keys(SUPPORTED_WALLETS).map((key) => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name);
      }
      return true;
    });
    if (
      connector instanceof WalletConnectConnector &&
      connector.walletConnectProvider?.wc?.uri
    ) {
      connector.walletConnectProvider = undefined;
    }

    activate(connector, undefined, true)
      .then(() => {
        wallet.setMetaMaskConnected();
      })
      .catch((error) => {
        if (error instanceof UnsupportedChainIdError || (error.code = 32002)) {
          activate(connector);
        } else {
          // setPendingError(true)
        }
      });
  };

  const onConnectWallet = () => {
    if (base.mode === CARD_ERC20_XRC20) {
      tryActivation(injected).then();
    } else {
      // @ts-ignore
      wallet.init();
    }
  };

  const onCopyAddress = (address) => () => {
    copy(address);
    notification.open({
      message: lang.t("copied_to_clipboard"),
      description: shortenAddress(address),
      duration: 1,
      style: {
        width: 250,
      },
    });
  };

  const renderWalletInfo = () => {
    const walletConnected =
      base.mode === CARD_ERC20_XRC20
        ? wallet.metaMaskConnected
        : wallet.walletConnected;
    const walletAddress = walletConnected
      ? base.mode === CARD_ERC20_XRC20
        ? ENSName || account
        : wallet.walletAddress
      : "";
    const walletBalance =
      base.mode === CARD_ERC20_XRC20
        ? userEthBalance?.toSignificant(4)
        : fromRau(`${wallet.walletBalance}`, "iotx");
    const balanceUnit = base.mode === CARD_ERC20_XRC20 ? "ETH" : wallet.token;

    return walletConnected ? (
      <>
        {chainId !== 1 && (
          <>
            <span className="capitalize inline-block rounded bg-primary c-green px-2">
              {ETH_NETWORKS[chainId]}
            </span>
            &nbsp;
          </>
        )}
        <span>
          {walletBalance}&nbsp;{balanceUnit}
        </span>
        &nbsp;&nbsp;
        <span className="component__header__content__wallet_address ">
          {shortenAddress(walletAddress)}
        </span>
        &nbsp;
        <CopyOutlined
          className="text-lg cursor-pointer"
          onClick={onCopyAddress(walletAddress)}
        />
        &nbsp;
        <Avatar
          src={base.mode === CARD_ERC20_XRC20 ? IMG_ETHER : IMG_IOTX}
          size="small"
        />
      </>
    ) : (
      <Button className="c-white" type="text" onClick={onConnectWallet}>
        {lang.t("header.connect_wallet")}
      </Button>
    );
  };

  return useObserver(() => (
    <div className="component__header h-10 sm:h-10 md:h-12 lg:h-16">
      <div className="component__header__content app_header_content flex justify-between items-center h-full py-1">
        <img alt="logo" className="h-full" src={IMG_LOGO} />
        <span className="flex items-center c-white font-thin">
          {renderWalletInfo()}
          &nbsp;
          <Button
            type="text"
            shape="circle"
            className="component__header__content__more c-white"
          >
            <EllipsisOutlined />
          </Button>
        </span>
      </div>
    </div>
  ));
};
