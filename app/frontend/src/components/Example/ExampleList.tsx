import { Example } from "./Example";

import styles from "./Example.module.css";

export type ExampleModel = {
    text: string;
    value: string;
};

const EXAMPLES: ExampleModel[] = [
    // {
    //     text: "Please summarize and compare the company's financial information over year 2020, 2021 & 2022, with key reasons for the change, including but not limited to following items: Revenue, Operating profit, Return on Equity, Operating Margin, Asset Under Management, Net debt, Cash and cash equivalents, Overall balance sheet strength, Operating efficiency, Cash flow analysis",
    //     value: "Please summarize and compare the company's financial information over year 2020, 2021 & 2022, with key reasons for the change, including but not limited to following items: Revenue, Operating profit, Return on Equity, Operating Margin, Asset Under Management, Net debt, Cash and cash equivalents, Overall balance sheet strength, Operating efficiency, Cash flow analysis"
    // },
    // {
    //     text: "Based on the information in the data source, which is the earnings call of the company, please summarize the call as much as possible, including but not limited to followings: Positive Updates, Negative Updates, Financial performance & highlights, Key reasons for the financial performance, Major developments & strategic changes, Challenges & opportunities, Future strategies & development, Market outlook, Guidance & expectation, Answers provided in the Q&A with details",
    //     value: "Based on the information in the data source, which is the earnings call of the company, please summarize the call as much as possible, including but not limited to followings: Positive Updates, Negative Updates, Financial performance & highlights, Key reasons for the financial performance, Major developments & strategic changes, Challenges & opportunities, Future strategies & development, Market outlook, Guidance & expectation, Answers provided in the Q&A with details"
    // },
    // {
    //     text: "Please conduct a detailed financial analysis for followings: Balance Sheet Strength, Profitability, Income statement analysis, Earnings Stability, Operating Efficiency, Cashflow analysis, Liquidity Analysis, Revenue Composition, Profit Drivers At the end, please also provide a conclusive analysis of the above",
    //     value: "Please conduct a detailed financial analysis for followings: Balance Sheet Strength, Profitability, Income statement analysis, Earnings Stability, Operating Efficiency, Cashflow analysis, Liquidity Analysis, Revenue Composition, Profit Drivers At the end, please also provide a conclusive analysis of the above"
    // }
     {
        text: "What can i know from you",
        value: "What can i know from you"
    },
    {
        text: "Can you draft me 10 questions i can ask from you",
        value: "Can you draft me 10 questions i can ask from you"
    },
    {
        text: "what is your role",
        value: "what is your role"
    }
];

interface Props {
    onExampleClicked: (value: string) => void;
}

export const ExampleList = ({ onExampleClicked }: Props) => {
    return (
        <ul className={styles.examplesNavList}>
            {EXAMPLES.map((x, i) => (
                <li key={i}>
                    <Example text={x.text} value={x.value} onClick={onExampleClicked} />
                </li>
            ))}
        </ul>
    );
};
