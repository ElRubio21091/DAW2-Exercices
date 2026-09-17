<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <!-- 3) Versió reduïda per EE: per a cada curs, Number i Title com atributs;
       Description com a subelement; i cognom de cada instructor com un subelement Instructor -->
  <xsl:template match="/Course_Catalog">
    <ee_courses>
      <xsl:for-each select="Department[@Code='EE']/Course">
        <Course Number="{@Number}" Title="{Title}">
          <Description><xsl:value-of select="Description"/></Description>
          <Instructors>
            <xsl:for-each select="Instructors/*">
              <Instructor><xsl:value-of select="Last_Name"/></Instructor>
            </xsl:for-each>
          </Instructors>
        </Course>
      </xsl:for-each>
    </ee_courses>
  </xsl:template>
</xsl:stylesheet>