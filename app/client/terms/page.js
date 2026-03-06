"use client";
import React from "react";
import useAuthGuard from "../hooks/useAuthGuard";
import styles from "./terms.module.css";
import Footer from "../Footer/page";

const termsContent = `
The domain www.indihands.com (that will hereafter be referred to as “Website”) belongs to Manik Trifaley Design Studio, a sole proprietorship firm having its office at 303, Meghana, DSK Ranawara, N.D.A. – Pashan road, Bavdhan, Pune, Maharashtra 411021 (hereafter referred to as “MTDS”). The use of this Website, services and tools are governed by the following terms and conditions as applicable to the Website including the policies incorporated herein (hereinafter referred to as “Terms of Use”). Your transaction/s on the website is subject to the terms of use that are applicable to the Website for such transaction. By mere use of the Website, you shall be contracting with MTDS and these terms of Use which constitute your binding obligations with MTDS. For the purpose of these Terms of Use, wherever the context so requires “You” or “User” shall mean any natural or legal person who has agreed to become a buyer on the Website by providing Registration Data while registering on the Website as Registered User using the computer systems. MTDS allows the User to browse the Website or making purchases without registering on the Website. The term “We”, “Us”, “Our” shall mean MTDS and/or website.

<b>MEMBERSHIP ELIGIBILITY</b>

The Website can only be used by the person who is able to form legally binding contracts under the Indian Contract Act, 1872. If a minor wishes to use the website, they shall do so under the guidance of a parent or a guardian and the transaction should be made by the parent or the guardian on their behalf. If it is discovered that you are a minor, your membership or access to the website may be terminated at any time by MTDS.

<b>YOUR ACCOUNT AND REGISTRATION OBLIGATIONS</b>

You are responsible for all activities that occur under your User ID and Password. At the time of registration, you agree to provide true, correct, and complete information about yourself. If you provide any information that is untrue, inaccurate, not current or incomplete or we have reasonable grounds to suspect that such information is untrue, inaccurate, not current or incomplete, or not in accordance with the User Agreement, MTDS has the right to indefinitely or temporarily terminate or suspend your membership with the Website and refuse to provide you with access to the Website.

<b>COMMUNICATIONS</b>

This document is an electronic record in terms of the Information Technology Act, 2000 and rules there under as amended time to time and as per the provisions pertaining to electronic records in various statutes as amended by the Information Technology Act, 2000. This document is published in accordance with the provisions of the Information Technology (Intermediaries guidelines) Rules, 2011 By using the Website and communicating with us via emails or any other means, you understand that you are communicating with us through electronic records and you consent to receive communications from us as and when required. The mode of communication may be subject to change. You agree that all agreements, notices, and other communications that we provide to you electronically satisfy the legal requirement that such communications be in writing.

<b>CHARGES</b>

Membership on the Website is free of any charges including for browsing of the website. However, MTDS reserves the right to introduce fee policy on the Website which will be posted on the website. Unless mentioned otherwise, all the prices and fee shall be quoted in Indian Rupees. You shall be solely responsible for your payments and all applicable laws including those in India in this regard.

<b>USE OF THE WEBSITE</b>

You agree on the following while using the website:

1.You shall not host, display, upload, modify, publish, transmit, update or share any information which:

(a): does not belong to you;

(b): is grossly harmful, harassing, blasphemous, defamatory, obscene, pornographic, podophilic, libelous, invasive of another’s privacy, hateful, or racially, ethnically objectionable, disparaging, relating or encouraging money laundering or gambling, or otherwise unlawful in any manner whatever; or unlawfully threatening or unlawfully harassing including but not limited to “indecent representation of women” within the meaning of the Indecent Representation of Women (Prohibition) Act, 1986;

(c): is misleading in any way whatsoever;

(d): is offensive to any community or is sexually explicit in nature;

(e): harasses an individual or a group of people;

(f): involves the transmission of “junk mail”, “chain letters”, or unsolicited mass mailing or “spamming”;

(g): is in itself illegal or in any way promotes illegal activities;

(h): infringes upon or violates any third party’s rights [including, but not limited to, intellectual property rights, rights of privacy (including without limitation unauthorized disclosure of a person’s name, email address, physical address or phone number) or rights of publicity];

(i): violates copyright laws and makes unauthorized use of someone else’s copyrighted intellectual property;

(j): contains restricted or password-only access pages, or hidden pages or images (those not linked to or from another accessible page);

(k): is exploitative in nature, sexual or otherwise;

(l): provides instructional information about illegal activities such as making or buying illegal weapons, terrorism and extremists activities, violating someone’s privacy, or providing or creating computer viruses;

(m): contains videos or images of another person;

(n) tries to gain unauthorized access or exceeds the scope of authorized access to the Website or to profiles, blogs, communities, account information, bulletins, friend request, or other areas of the Website or solicits passwords or personal identifying information for commercial or unlawful purposes from other users;

(o) engages in commercial activities and/or sales without our prior written consent such as contests, sweepstakes, barter, advertising and pyramid schemes, or the buying or selling of “virtual” products related to the Website. Throughout this Terms of Use, MTDSs prior written consent means a communication coming from MTDS’, specifically in response to Your request, and specifically addressing the activity or conduct for which You seek authorization;

(p): promotes or solicits any activity that can be construed as illegal;

(q): infringes upon another user’s experience of the website;

(r): refers to any external website that contains illegal content, offensive or according to Us inappropriate in any way.

(s): harm minors in any way;

(t): infringes any patent, trademark, copyright or other proprietary rights or third party’s trade secrets or rights of publicity or privacy or shall not be fraudulent or involve the sale of counterfeit or stolen products;

(u): violates any law;

(v): is misleading in any way;

(w): impersonates another individual or organization;

(x): contains virus or any other code that aims to disturb the functionality of any computer resource or steal any type of data;

(y): threatens the unity, societal peace, integrity, defense, security or sovereignty of India, friendly relations with foreign states, or public order;

(z): shall not be false, inaccurate or misleading;

(aa) shall not, directly or indirectly, offer, attempt to offer, trade or attempt to trade in any item, the dealing of which is prohibited or restricted in any manner under the provisions of any applicable law, rule, regulation or guideline for the time being in force.

(ab) shall not create liability for Us or cause Us to lose (in whole or in part) the services of Our internet service provider (“ISPs”) or other suppliers;

(za) which is racist, hateful, sexual or obscene in any public area. This includes text within listings, on all other areas of the site that another User may view. If such profane words are part of a title for the item being sold, we will ‘blur’ out the bulk of the offending word with asterisks (i.e., s*** or f***).

Please report any violations of the above to the correct area for review:

* Report offensive Display Names

* Report offensive language

2.	If a feedback comment; or any communication made between Users on the Website; or email communication between Users in relation to transactions conducted on Website contain profanity, such feedback comment or such communication shall be removed and MTDS may also proceed to take disciplinary action against such user which may result in the indefinite suspension of a User’s account, temporary suspension, or a formal warning.
MTDS will consider the circumstances of an alleged violation of the Terms of Use and the user’s trading records before taking action.

Violations of such Terms of Use may result in a range of actions, including:

1. Limits placed on account privileges;
2. Loss of special status;
3. Account suspension.
4. You shall not use any “deep-link”, “page-scrape”, or other automatic device, program, algorithm or methodology, or any similar or equivalent manual process, to access, acquire, copy or monitor any portion of the Website or any Content, or in any way reproduce or circumvent the navigational structure or presentation of the Website or any Content, to obtain or attempt to obtain any materials, documents or information through any means not purposely made available through the Website. We reserve our right to prohibit any such activity.
5. You shall not hack, “mine” password or use any other illegitimate means to attempt to gain unauthorized access to any part or feature of the Website, or any other systems or networks connected to the Website or to any server, computer, network, or to any of the services offered on or through the Website.
6. You shall not test, scan or probe the vulnerability of the Website or any network connected to the Website or attempt to breach the security or authentication measures on the Website or any network connected to the Website. You may not reverse look-up, trace or seek to trace any information on any other User of or visitor to the Website, or any other client, including any account on the Website not owned by You, to its source, or exploit the Website or any service or information made available or offered by or through the Website, in any capacity where the purpose is to reveal any information other than Your own information, as provided for by the Website.
7. You shall not make any negative, denigrating or defamatory statement(s) or comment(s) about Us or the brand name or domain name used by Us including the terms MTDS, www.indihands.com or otherwise engage in any conduct or action that might tarnish the image or reputation, of MTDS or tarnish or dilute any MTDS’s trade or service marks, trade name and/or goodwill associated with such trade or service marks, trade name as may be owned or used by us.
8. You agree that you will not take any action that imposes an unreasonable or disproportionately large load on the infrastructure of the Website or MTDS’s systems or networks, or any systems or networks connected to MTDS.
9. You agree not to use any device, software or routine to interfere or attempt to interfere with the proper working of the Website or any transaction being conducted on the Website, or with any other person’s use of the Website.
10.	You may not forge headers or manipulate identifiers in order to disguise the origin of any message or transmittal You send to Us on or through the Website or any service offered on or through the Website. You may not pretend that You represent someone else, or impersonate any other individual or entity.
11.	You may not use the Website or any content for any purpose that is unlawful or prohibited by these Terms of Use, or to solicit the performance of any illegal activity or other activity which infringes the rights of MTDS and/or others.
12.	You shall at all times guarantee full compliance with the provisions of all applicable domestic laws, rules and regulations including Exchange Control Laws and International Laws, Foreign Exchange Laws, Statutes, Ordinances regarding our services and your transaction and use of website. You shall not engage in any transaction in an item or service, which is prohibited by the provisions of any applicable law including exchange control laws or regulations for the time being in force.
13.	To enable Us to utilize the information You supply Us with, so that we are not violating any rights You might have in Your information, You agree to grant Us a non-exclusive, worldwide, royalty-free, perpetual, irrevocable, sub-licensable (through various tiers) right to exercise the copyright, publicity, database rights or any other rights You have in Your Information, in any media now known or not currently known, with respect to Your Information. Your information will only be used in accordance with the Terms of Use and Privacy Policy applicable to use of the Website.
14.	You shall not participate in advertising to, or solicitation of, other Users of the Website to buy or sell any products or services, including, but not limited to, products or services related to that being displayed on the Website or related to us. You may not transmit any chain letters or unsolicited commercial or junk email to other Users via the Website. The Terms of Use will be violated if you use any information obtained from the Website in order to harass, abuse, or harm another person, or in order to contact, advertise to, solicit, or sell to another person other than Us without Our prior explicit consent. In order to protect Our Users from such advertising or solicitation, We reserve the right to restrict the number of messages or emails which a user may send to other Users in any 24-hour period which We deem appropriate in our sole discretion. We have the right at all times to disclose any information (including the identity of the persons providing information or materials on the Website) as needed to satisfy any law, regulation or valid governmental request. This may include, without limitation, disclosure of the information in connection with investigation of alleged illegal activity or solicitation of illegal activity or in response to a lawful court order or subpoena. In addition, We can (and You hereby expressly authorize Us to) disclose any information about You to law enforcement or other government officials, as we, in Our sole discretion, believe necessary or appropriate in connection with the investigation and/or resolution of possible crimes, especially those that may involve personal injury.
15.	We reserve the right, but have no obligation, to screen and monitor the materials posted on the Website. MTDS shall reserve the right to eliminate or alter any content that in its sole discretion violates, or is alleged to violate, any applicable law or either the spirit or letter of these Terms of Use. Notwithstanding this right, YOU REMAIN SOLELY RESPONSIBLE FOR THE CONTENT OF THE MATERIALS YOU POST ON THE WEBSITE AND IN YOUR PRIVATE MESSAGES. Please be advised that such Content posted does not necessarily reflect MTDS’s views. In no event shall MTDS assume or have any responsibility or liability for any Content posted or for any claims, damages or losses resulting from use of Content and/or appearance of Content on the Website. You hereby represent and warrant that You have all necessary rights in and to all Content which You provide and all information it contains and that such Content shall not encroach any proprietary or other rights of third parties or contain any libelous, or otherwise unlawful information.

Except as expressly provided in these Terms of Use, no part of the Website and no Content may be copied, uploaded, reproduced, republished, posted, encoded, publicly displayed, translated, transmitted or distributed in any way (including “mirroring”) to any other computer, server, Website or other medium for publication or distribution or for any commercial enterprise, without MTDS’s express prior written consent. All text, graphics, user interfaces, visual interfaces, photographs, trademarks, logos, sounds, music and artwork (collectively, “Content”), are the sole property of MTDS.

You may use information on the products and services purposely made available on the Website for downloading, provided that You: –

(1) do not remove any proprietary notice language in all copies of such documents,

(2) use such information only for your personal, non-commercial informational purpose,

(3) do not copy or post such information on any networked computer or broadcast it in any media,

(4) make no modifications to any such information, and

(5) do not make any additional representations or warranties relating to such documents.

The Content that you post will become Our property and You grant Us the worldwide, perpetual and transferable rights of such Content. You agree that any Content You post may be used by us, consistent with Our Privacy Policy and Rules of Conduct on Site as mentioned herein, and You are not entitled to any payment or other compensation for such use.

16. We do not approve any unauthorized uses of your personal information, but by using the Website You acknowledge and agree that We are not responsible for the harmful or unlawful use of any personal information by a third party that You publicly disclose or share with others on the Website. Please be cautious while selecting the type of information that You publicly disclose or share with others on the Website.

17. MTDS shall have all the rights to take necessary action and claim damages that may occur due to your involvement/participation in any way on your own or through group/s of people, intentionally or unintentionally in DoS/DDoS (Distributed Denial of Services).

<b>PRIVACY</b>

You may would like to refer to separate privacy policy available on the website.

<b>ORDER CANCELLATION BY MTDS</b>

Due to unavoidable circumstances, there may be times when certain orders having been validly placed may not be processed or capable of being dispatched. MTDS reserves the exclusive right to refuse or cancel any order for any reason. Some instances that may result in your order being cancelled shall include limitations on quantities available for purchase, inaccuracies or errors in product or pricing information, problems identified by our credit and fraud avoidance department or any defect regarding the quality of the product. We may also require additional verifications or information before accepting any order. We will contact you if all or any portion of your order is cancelled or if additional information is required to accept your order. If your order is cancelled after your credit card/ debit card/ any other mode of payment has been charged, the said amount will be reversed into your Account/ as the case may be to the source of the payment within a period of 30 working days. Any type of voucher used in these orders shall be returned and made available to the user in case of cancellation by MTDS.

<b>DISCLAIMER OF WARRANTIES AND LIABILITY</b>

This Website or the material and products and services, included on or otherwise made available to You through this website are provided on “as is” and “as available” basis without any representation or warranties, express or implied except otherwise specified in writing. Without prejudice to the forgoing paragraph, MTDS does not warrant that:
•	This Website will be constantly available
•	The information on this Website is complete, true, accurate or non-misleading.

MTDS will not be liable to You in any way or in relation to the Contents of, or use of, or otherwise in connection with, the Website. MTDS does not warrant that this site; information, Content, materials, product (including software) or services included on or otherwise made available to You through the Website; their servers; or electronic communication sent from Us are free of viruses or other harmful components.
All the Products sold on Website are governed by different state laws and if MTDS is unable to deliver such Products due to implications of different state laws, MTDS will return or will give credit for the amount (if any) received in advance from the sale of such Product that could not be delivered to You.
You will be required to enter a valid phone number while placing an order on the Website. By registering Your phone number with us, You consent to be contacted by Us via phone calls and/or SMS notifications, in case of any order or shipment or delivery related updates. Your personal information will not be used to initiate any promotional phone calls or SMS, unless you are a member of our loyalty program.

<b>RIGHT TO CHANGE / SEVERABILITY</b>

MTDS reserves the sole right to update or modify these Terms of Use at any time without prior notice. For this reason, we encourage you to review these Terms of Use every time you purchase products from us or use our Website. Your use of the Website following the posting of changes will mean that you accept and agree to the revisions. As long as You comply with these Terms of Use, We grant You a personal, non-exclusive, non-transferable, limited privilege to enter and use the Website. If any of these terms of use shall be deemed invalid, void, or for any reason unenforceable, that terms of use shall be deemed severable and shall not affect the validity and enforceability of any remaining terms of use.

<b>INDEMNITY</b>

You shall indemnify and hold harmless MTDS, its owner, licensee, affiliates, subsidiaries, group companies (as applicable) and their respective officers, directors, agents, and employees, from any claim or demand, or actions including reasonable attorneys’ fees, made by any third party or penalty imposed due to or arising out of Your breach of this Terms of Use, privacy Policy and other Policies, or Your violation of any law, rules or regulations or the rights (including infringement of intellectual property rights) of a third party.

<b>BREACH</b>

In the event you are found to be in breach of the Terms of Use or Privacy Policy or other rules and policies or if we are unable to verify or authenticate any information you provide or if it is believed that your actions may cause legal liability for you, other users or us, without limiting to the present, without prior notice immediately limit your activity, remove your information, temporarily/indefinitely suspend or terminate or block your membership, and/or refuse to provide you with access to this Website. Any user that has been suspended or blocked may not register or attempt to register with us or use the Website in any manner whatsoever until such time that such user is reinstated by us. It may be noted that if you breach the Terms of Use or Privacy Policy or other rules and policies, we reserve the right to recover any amounts due and owing by you to us and to take strict legal action against you. Any breach of any applicable local laws of that territory shall also result in, without prior notice immediately limit your activity, remove your information, temporarily/indefinitely suspend or terminate or block your membership, and/or refuse to provide you with access to this Website.

<b>WAIVER</b>

The failure by MTDS to enforce at any time or for any period any terms of use, it shall not be a waiver by MTDS of such terms of use or of the right any time subsequent to enforce such terms of Use of this agreement.

<b>FORCE MAJEURE</b>

If MTDS fails to perform any of its obligations and is unable to furnish any of its Services, such event shall not entitle you to raise any claim against MTDS or be called a breach hereunder to the extent that such failure arises from an event of Force Majeure. If through force Majeure the fulfilment by either party of any obligation set forth in this Agreement will be delayed, the period of such delay will not be counted on in computing periods prescribed by this Agreement. Force Majeure will include any war, civil commotion, strike, governmental action, lockout, accident, epidemic, pandemic, floods, fire or any other event of any nature or kind whatsoever which is beyond the control of MTDS that directly or indirectly hinders or prevents MTDS from commencing or proceeding with consummation of the transactions contemplated hereby. You expressly agree that lack of funds shall not in any event constitute or be considered an event of Force Majeure.

<b>DISPUTE RESOLUTION</b>

These terms of use shall be construed and the legal relations between YOU and MTDS hereto shall be determined and governed according to the laws of India. If any dispute arises between You and MTDS regarding Your use of the Website or Your dealing with MTDS in relation to any activity on the Website, in connection with the validity, interpretation, implementation or breach of any provision of the terms of use the dispute shall be subject to the exclusive jurisdiction to the Courts at Pune, Maharashtra. However, your obligations payments shall not be suspended during the pendency of such proceedings.

<b>APPLICABLE LAW</b>

Terms of Use shall be governed by and interpreted and construed in accordance with the laws of India. The place of jurisdiction shall be exclusively in Pune. Jurisdictional Issues/Sale in India Only MTDS make no claim that materials in the Website are appropriate or available for use in other locations/countries other than India. Unless otherwise specified, the material on the Website is presented solely for the purpose of sale in India. Those who choose to access this site from other locations/Countries other than India do so on their own initiative and MTDS is not responsible for supply of products/refund for the products ordered from other locations/Countries other than India, compliance with local laws, if and to the extent local laws are applicable.

<b>TRADEMARK, COPYRIGHT AND RESTRICTION</b>

This site is controlled and operated by MTDS and products are sold by MTDS. All material on this site, including images, illustrations, audio clips, and video clips, are protected by copyrights, trademarks, and other intellectual property rights. Material on Website is solely for Your personal, non-commercial use. You must not copy, reproduce, republish, upload, post, transmit or distribute such material in any way, including by email or other electronic means and whether directly or indirectly and You must not assist any other person to do so. Without the prior written consent of the owner, modification of the materials, use of the materials on any other website or networked computer environment or use of the materials for any purpose other than personal, non-commercial use is a violation of the copyrights, trademarks and other proprietary rights, and is prohibited. Any use for which You receive any remuneration, whether in money or otherwise, is a commercial use for the purposes of this clause. Trademark complaint MTDS respects the intellectual property of others. In case You feel that Your Trademark has been infringed, you can write to MTDS at manik@mtds.co.in

<b>PRODUCT DESCRIPTION</b>

Products displayed on the website attempts to be as accurate as possible. However, MTDS does not warrant that product descriptions or other content is accurate, complete, reliable, current, or error- free. MTDS assumes no liability in regard to the accuracy, reliability, completeness, and errors of the Product description or other content of this Website.

<b>PRODUCT COMPLIANCE</b>

Products displayed/ sold on the website are manufactured as per the applicable local laws of India and are in conformity with the required Indian industry standards.

<b>PRODUCT PRICING DISCLAIMER</b>

The prices displayed on the website may differ from prices that are available in store. Further the prices displayed in our catalogues may differ from country to country for the same product. Prices shown on the website are subject to change without prior notice. These prices only reflect the MRP and do not include shipping and taxes which may be extra as applicable.

<b>INACCURACY DISCLAIMER</b>

From time to time there may be information on our Website or in our catalogue that may contain typographical errors, inaccuracies, or omissions that may relate to product descriptions, pricing, and availability. MTDS reserves the right to correct any errors, inaccuracies or omissions and to change or update information at any time without prior notice.

<b>LIMITATION OF LIABILITY</b>

IN NO EVENT SHALL MTDS BE LIABLE FOR ANY SPECIAL, INCIDENTAL, INDIRECT OR CONSEQUENTIAL DAMAGES OF ANY KIND IN CONNECTION WITH THESE TERMS OF USE, EVEN IF USER HAS BEEN INFORMED IN ADVANCE OF THE POSSIBILITY OF SUCH DAMAGES.

<b>CONTACT US</b>

Please contact us for any questions or comments (including all inquiries unrelated to copyright infringement) regarding this Website.

<b>GRIEVANCE OFFICER</b>

In accordance with Information Technology Act, 2000 and rules made there under, the name and contact details of the Grievance Officer are provided below:

Mrs. Manik Mandar Trifaley

MTDS

303, Meghana, Building no 14, DSK Ranawara, NDA-Pashan Road, Bavdhan, Pune, Maharashtra – 411021

Phone: 9822513937

Email: manik@mtds.co.in

Time: Mon – Sat (10:00 – 18:00)

<b>EMAIL ABUSE & THREAT POLICY</b>

Private communication, including email correspondence, is not regulated by MTDS. MTDS encourages its Users to be professional, courteous and respectful when communicating by email. However, MTDS will investigate and can take action on certain types of unwanted emails that violate its policies.
Such instances:
Threats of Bodily Harm – Threats of bodily harm are not permitted by MTDS. MTDS policy prohibits user-to-user threats of physical harm via any method including, phone, email and on Our public message boards.
Misuse of MTDS System – MTDS allows Users to facilitate transactions through the MTDS’s system, but will investigate any misuse of this service.
Spoof (Fake) email –MTDS will never ask you to provide sensitive information through email and in case you do receive such an email, you are requested to report the same to Us through the ‘Contact Us’ tab.
Offers to Buy or Sell Outside of MTDS – MTDS prohibits email offers to buy or sell listed products outside of the MTDS Website. Offers of this nature are a potential fraud risk for Users.
Spam (Unsolicited Commercial email) – MTDS’s spam policy applies only to unsolicited commercial or spam messages sent by MTDS Users.
Violations of this policy may result in a range of actions, including:

* Limits on account privileges

* Suspension of account

* Cancellation of listings

* Loss of special status

<b>OTHER BUSINESSES</b>

The Website may provide links to the third-party websites of Our affiliated companies and certain other businesses for which, MTDS assumes no responsibility for examining or evaluating the products and services offered by them. MTDS does not take responsibility or liability for the actions, products, content and services on the Website, which are linked to Affiliates and / or third-party websites using Website’s APIs or otherwise. MTDS does not endorse, in any way, any third-party website(s) or content thereof.


`;

const Page = () => {
  useAuthGuard();

  return (
    <div className={`${styles.dashboardWrapper} container-fluid`}>
      <div className=" pageTitle">
        Terms and Conditions
      </div>

      <div
        className={styles.termsText}
        dangerouslySetInnerHTML={{ __html: termsContent }}
      />
      <Footer/>
    </div>
  );
};

export default Page;