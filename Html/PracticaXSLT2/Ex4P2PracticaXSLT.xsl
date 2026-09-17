<?xml version="1.0" encoding="ISO-8859-1"?>
<xsl:stylesheet version="2.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <!-- 4) Països amb més de 3 idiomes: nom com a atribut i el número d'idiomes com a subelement;
       ordre desc (dels idiomes) -->
  <xsl:template match="/countries">
    <countries-with-many-languages>
      <xsl:for-each select="country[count(language) > 3]">
        <country name="{@name}">
          <languages-count><xsl:value-of select="count(language)"/></languages-count>
        </country>
      </xsl:for-each>
    </countries-with-many-languages>
  </xsl:template>
</xsl:stylesheet>